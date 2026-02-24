import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createPrediction,
  getPendingPredictions,
  readStoredPredictions,
  scorePrediction as scoreStoredPrediction,
  writeStoredPredictions,
} from "../lib/prediction-engine";
import { calculateBattingAverage } from "../lib/prediction-scorer";
import { supabase } from "../lib/supabase";

const PREDICTION_COLUMNS =
  "id,user_id,signal_id,type,condition,target_date,created_at,scored_at,outcome,notes";

function normalizeOutcome(value) {
  const normalized = value == null ? null : String(value).trim().toLowerCase();
  return normalized === "hit" ||
    normalized === "miss" ||
    normalized === "partial"
    ? normalized
    : null;
}

function normalizePredictionRecord(row, signalById = new Map()) {
  const condition =
    row?.condition && typeof row.condition === "object" ? row.condition : {};
  const linkedSignal = row?.signal_id ? signalById.get(row.signal_id) : null;
  const outcome = normalizeOutcome(row?.outcome);
  const scoredAt = row?.scored_at || null;
  const status = scoredAt || outcome ? "scored" : "pending";

  return {
    id: row?.id,
    type: row?.type || "threshold",
    signalId: row?.signal_id ?? null,
    signalName: linkedSignal?.signal_name ?? condition.signalName ?? null,
    dominoId: linkedSignal?.domino_id ?? condition.dominoId ?? null,
    condition,
    targetDate: row?.target_date,
    createdAt: row?.created_at,
    scoredAt,
    outcome,
    notes: row?.notes || null,
    status,
  };
}

async function resolveStorageMode() {
  if (!supabase) return { mode: "local", user: null };

  try {
    const { data, error } = await supabase.auth.getUser();
    if (data?.user) return { mode: "supabase", user: data.user };
    if (data && !data.user) {
      return { mode: "supabase", user: { id: "personal" } };
    }
    if (error) return { mode: "local", user: null };
    return { mode: "supabase", user: { id: "personal" } };
  } catch {
    return { mode: "local", user: null };
  }
}

async function fetchSupabasePredictions(userId) {
  const { data, error } = await supabase
    .from("predictions")
    .select(PREDICTION_COLUMNS)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  const rows = Array.isArray(data) ? data : [];

  const signalIds = [
    ...new Set(rows.map((row) => row.signal_id).filter(Boolean)),
  ];
  const signalById = new Map();

  if (signalIds.length > 0) {
    const { data: signalRows, error: signalError } = await supabase
      .from("signal_statuses")
      .select("id,domino_id,signal_name")
      .in("id", signalIds);

    if (!signalError) {
      for (const signal of signalRows || []) {
        signalById.set(signal.id, signal);
      }
    }
  }

  return rows.map((row) => normalizePredictionRecord(row, signalById));
}

export function usePredictions() {
  const queryClient = useQueryClient();

  const predictionsQuery = useQuery({
    queryKey: ["predictions"],
    queryFn: async () => {
      const storage = await resolveStorageMode();
      if (storage.mode === "supabase" && storage.user?.id) {
        return fetchSupabasePredictions(storage.user.id);
      }

      return readStoredPredictions().sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    },
    staleTime: 30 * 1000,
  });

  const addPredictionMutation = useMutation({
    mutationFn: async ({ template, params }) => {
      const built = createPrediction(template, params);
      const storage = await resolveStorageMode();

      if (storage.mode === "supabase" && storage.user?.id) {
        if (!built.signalId) {
          throw new Error(
            "Signal id is required to store predictions in Supabase",
          );
        }

        const insertPayload = {
          user_id: storage.user.id,
          signal_id: built.signalId,
          type: built.type,
          condition: built.condition,
          target_date: built.targetDate,
          created_at: built.createdAt,
          scored_at: null,
          outcome: null,
          notes: built.notes,
        };

        const { data, error } = await supabase
          .from("predictions")
          .insert(insertPayload)
          .select(PREDICTION_COLUMNS)
          .single();

        if (error) throw error;
        return normalizePredictionRecord(data);
      }

      const existing = readStoredPredictions();
      const next = [built, ...existing];
      writeStoredPredictions(next);
      return built;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["predictions"] });
    },
  });

  const scorePredictionMutation = useMutation({
    mutationFn: async ({ id, outcome }) => {
      const storage = await resolveStorageMode();
      const normalizedOutcome = normalizeOutcome(outcome);

      if (!normalizedOutcome) {
        throw new Error(`Invalid prediction outcome: "${outcome}"`);
      }

      if (storage.mode === "supabase" && storage.user?.id) {
        const updatePayload = {
          outcome: normalizedOutcome,
          scored_at: new Date().toISOString(),
        };

        const { data, error } = await supabase
          .from("predictions")
          .update(updatePayload)
          .eq("id", id)
          .eq("user_id", storage.user.id)
          .select(PREDICTION_COLUMNS)
          .single();

        if (error) throw error;
        return normalizePredictionRecord(data);
      }

      const updated = scoreStoredPrediction(id, normalizedOutcome);
      if (!updated) {
        throw new Error("Prediction not found");
      }

      return updated;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["predictions"] });
    },
  });

  const predictions = predictionsQuery.data || [];

  const activePredictions = useMemo(
    () => getPendingPredictions(predictions),
    [predictions],
  );

  const scoredPredictions = useMemo(
    () =>
      predictions
        .filter(
          (prediction) => prediction.status === "scored" || prediction.outcome,
        )
        .sort((a, b) => {
          const left = new Date(b.scoredAt || b.targetDate || 0).getTime();
          const right = new Date(a.scoredAt || a.targetDate || 0).getTime();
          return left - right;
        }),
    [predictions],
  );

  const battingAverage = useMemo(
    () => calculateBattingAverage(scoredPredictions),
    [scoredPredictions],
  );

  return {
    predictions,
    activePredictions,
    scoredPredictions,
    battingAverage,
    addPrediction: async (template, params) =>
      addPredictionMutation.mutateAsync({ template, params }),
    scorePrediction: async (id, outcome) =>
      scorePredictionMutation.mutateAsync({ id, outcome }),
    isLoading:
      predictionsQuery.isLoading ||
      addPredictionMutation.isPending ||
      scorePredictionMutation.isPending,
  };
}
