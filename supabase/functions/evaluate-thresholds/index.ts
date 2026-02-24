import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

type Status = "green" | "amber" | "red";
type Comparator = "lt" | "gt";

type SignalDefinitionRow = {
  domino_id: number;
  signal_name: string;
  status: Status;
  is_override: boolean | null;
};

type SignalDataPointRow = {
  domino_id: number;
  signal_name: string;
  value: string;
  created_at: string;
};

type ThresholdDefinition = {
  comparator: Comparator;
  amber: number;
  red: number;
};

type PredictionOutcome = "hit" | "miss" | "partial";

type PredictionCondition = {
  operator?: string;
  threshold?: number | string;
  direction?: string;
  baselineValue?: number | string | null;
  startValue?: number | string | null;
  valueAtCreation?: number | string | null;
  min?: number | string;
  max?: number | string;
  dominoId?: number | string | null;
  signalName?: string | null;
};

type PredictionRow = {
  id: string;
  signal_id: string | null;
  type: string;
  condition: PredictionCondition | null;
  target_date: string;
  created_at: string;
  scored_at: string | null;
  outcome: string | null;
};

type SignalStatusLookupRow = {
  id: string;
  domino_id: number;
  signal_name: string;
};

// Threshold definitions are loaded from the threshold_config table at runtime.
// This eliminates duplication between client and server-side evaluation.
// Fallback hardcoded definitions are kept only as a safety net if the DB read fails.
const FALLBACK_THRESHOLDS: Record<string, ThresholdDefinition> = {
  "1|Public SaaS Net Revenue Retention": {
    comparator: "lt",
    amber: 120,
    red: 110,
  },
  "2|JOLTS: Professional Services Openings": {
    comparator: "lt",
    amber: 1.8,
    red: 1.5,
  },
  "2|Initial Jobless Claims Composition": {
    comparator: "gt",
    amber: 280,
    red: 350,
  },
  "3|Stablecoin Transaction Volume": {
    comparator: "gt",
    amber: 1000,
    red: 2000,
  },
  "4|M2 Velocity of Money": { comparator: "lt", amber: 1.15, red: 1.0 },
  "4|Consumer Confidence vs. CEO Confidence": {
    comparator: "lt",
    amber: 98,
    red: 95,
  },
  "4|Labor Share of GDP": { comparator: "lt", amber: 55, red: 52 },
  "5|Alt Manager Stock Prices (BX, APO, KKR)": {
    comparator: "lt",
    amber: -15,
    red: -25,
  },
};

type ThresholdConfigRow = {
  domino_id: number;
  signal_name: string;
  comparator: string;
  amber_value: number | null;
  red_value: number | null;
  enabled: boolean;
};

async function loadThresholdDefinitions(
  supabase: ReturnType<typeof createClient>,
): Promise<Record<string, ThresholdDefinition>> {
  const { data, error } = await supabase
    .from("threshold_config")
    .select(
      "domino_id, signal_name, comparator, amber_value, red_value, enabled",
    )
    .eq("enabled", true);

  if (error || !data || data.length === 0) {
    return FALLBACK_THRESHOLDS;
  }

  const definitions: Record<string, ThresholdDefinition> = {};
  for (const row of data as ThresholdConfigRow[]) {
    if (row.amber_value === null || row.red_value === null) continue;
    const key = `${row.domino_id}|${row.signal_name}`;
    definitions[key] = {
      comparator: row.comparator as Comparator,
      amber: row.amber_value,
      red: row.red_value,
    };
  }

  return Object.keys(definitions).length > 0
    ? definitions
    : FALLBACK_THRESHOLDS;
}

const CORS_HEADERS = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const jsonResponse = (payload: unknown, status = 200): Response =>
  new Response(JSON.stringify(payload), {
    status,
    headers: CORS_HEADERS,
  });

const signalKey = (dominoId: number, signalName: string): string =>
  `${dominoId}|${signalName}`;

const parseNumericValue = (value: string): number | null => {
  const match = String(value ?? "")
    .replaceAll(",", "")
    .match(/-?\d+(\.\d+)?/);

  if (!match) {
    return null;
  }

  const parsed = Number(match[0]);
  return Number.isFinite(parsed) ? parsed : null;
};

const evaluateStatus = (
  value: number,
  threshold: ThresholdDefinition,
): Status => {
  if (threshold.comparator === "lt") {
    if (value < threshold.red) return "red";
    if (value < threshold.amber) return "amber";
    return "green";
  }

  if (value > threshold.red) return "red";
  if (value > threshold.amber) return "amber";
  return "green";
};

const toNumber = (value: unknown): number | null => {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value === "string") {
    const match = value.replaceAll(",", "").match(/-?\d+(\.\d+)?/);
    if (!match) return null;
    const parsed = Number(match[0]);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
};

const normalizeOperator = (value: unknown): "gt" | "gte" | "lt" | "lte" => {
  const raw = String(value ?? "gte")
    .trim()
    .toLowerCase();
  if (raw === ">" || raw === "gt") return "gt";
  if (raw === ">=" || raw === "gte") return "gte";
  if (raw === "<" || raw === "lt") return "lt";
  if (raw === "<=" || raw === "lte") return "lte";
  return "gte";
};

const hasReachedTargetDate = (value: string): boolean => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return false;
  return parsed.getTime() <= Date.now();
};

const evaluatePredictionOutcome = (
  prediction: PredictionRow,
  currentValue: number | null,
): PredictionOutcome => {
  const condition = prediction.condition ?? {};
  const type = String(prediction.type || "")
    .trim()
    .toLowerCase();

  if (type === "threshold") {
    const threshold = toNumber(condition.threshold);
    if (threshold === null || currentValue === null) return "partial";

    const operator = normalizeOperator(condition.operator);
    if (operator === "gt") return currentValue > threshold ? "hit" : "miss";
    if (operator === "gte") return currentValue >= threshold ? "hit" : "miss";
    if (operator === "lt") return currentValue < threshold ? "hit" : "miss";
    return currentValue <= threshold ? "hit" : "miss";
  }

  if (type === "direction") {
    const baseline = toNumber(
      condition.baselineValue ??
        condition.startValue ??
        condition.valueAtCreation,
    );
    if (baseline === null || currentValue === null) return "partial";

    const direction = String(condition.direction || "")
      .trim()
      .toLowerCase();
    const delta = currentValue - baseline;
    if (delta === 0) return "partial";
    if (direction === "up") return delta > 0 ? "hit" : "miss";
    if (direction === "down") return delta < 0 ? "hit" : "miss";
    return "partial";
  }

  if (type === "range") {
    const min = toNumber(condition.min);
    const max = toNumber(condition.max);
    if (min === null || max === null || currentValue === null) return "partial";
    const low = Math.min(min, max);
    const high = Math.max(min, max);
    return currentValue >= low && currentValue <= high ? "hit" : "miss";
  }

  return "partial";
};

const resolvePredictionCurrentValue = (
  prediction: PredictionRow,
  statusLookupById: Map<string, SignalStatusLookupRow>,
  latestDataPointBySignal: Map<string, SignalDataPointRow>,
): number | null => {
  if (prediction.signal_id) {
    const mapped = statusLookupById.get(prediction.signal_id);
    if (mapped) {
      const latestPoint = latestDataPointBySignal.get(
        signalKey(mapped.domino_id, mapped.signal_name),
      );
      if (latestPoint) {
        return parseNumericValue(latestPoint.value);
      }
    }
  }

  const condition = prediction.condition ?? {};
  const fallbackDominoId = Number(condition.dominoId);
  const fallbackSignalName = String(condition.signalName ?? "").trim();

  if (!Number.isFinite(fallbackDominoId) || !fallbackSignalName) {
    return null;
  }

  const latestPoint = latestDataPointBySignal.get(
    signalKey(fallbackDominoId, fallbackSignalName),
  );
  if (!latestPoint) return null;
  return parseNumericValue(latestPoint.value);
};

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: CORS_HEADERS });
  }

  if (request.method !== "GET" && request.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  const supabaseUrl =
    Deno.env.get("SUPABASE_URL") ?? Deno.env.get("VITE_SUPABASE_URL");
  const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    return jsonResponse(
      {
        evaluated: 0,
        changed: 0,
        errors: [
          "Missing SUPABASE_URL (or VITE_SUPABASE_URL) or SUPABASE_SERVICE_ROLE_KEY",
        ],
      },
      500,
    );
  }

  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: { persistSession: false },
  });

  const errors: string[] = [];
  let evaluated = 0;
  let changed = 0;
  let predictionsEvaluated = 0;
  let predictionsScored = 0;

  // Load threshold definitions from DB (single source of truth)
  const THRESHOLD_DEFINITIONS = await loadThresholdDefinitions(supabase);

  const [
    { data: signalDefinitions, error: definitionsError },
    { data: dataPoints, error: dataPointsError },
  ] = await Promise.all([
    supabase
      .from("signal_statuses")
      .select("domino_id, signal_name, status, is_override")
      .order("domino_id", { ascending: true }),
    supabase
      .from("signal_data_points")
      .select("domino_id, signal_name, value, created_at")
      .order("created_at", { ascending: false }),
  ]);

  if (definitionsError) {
    errors.push(
      `Failed to fetch signal definitions: ${definitionsError.message}`,
    );
  }

  if (dataPointsError) {
    errors.push(
      `Failed to fetch latest data points: ${dataPointsError.message}`,
    );
  }

  const definitions = (signalDefinitions ?? []) as SignalDefinitionRow[];
  const points = (dataPoints ?? []) as SignalDataPointRow[];

  const latestDataPointBySignal = new Map<string, SignalDataPointRow>();
  for (const point of points) {
    const key = signalKey(point.domino_id, point.signal_name);
    if (!latestDataPointBySignal.has(key)) {
      latestDataPointBySignal.set(key, point);
    }
  }

  for (const definition of definitions) {
    const key = signalKey(definition.domino_id, definition.signal_name);
    const threshold = THRESHOLD_DEFINITIONS[key];

    if (!threshold) {
      continue;
    }

    if (definition.is_override) {
      continue;
    }

    const latestPoint = latestDataPointBySignal.get(key);
    if (!latestPoint) {
      errors.push(`No data point found for ${key}`);
      continue;
    }

    const parsedValue = parseNumericValue(latestPoint.value);
    if (parsedValue === null) {
      errors.push(
        `Could not parse numeric value for ${key}: "${latestPoint.value}"`,
      );
      continue;
    }

    const nextStatus = evaluateStatus(parsedValue, threshold);
    evaluated += 1;

    if (nextStatus === definition.status) {
      continue;
    }

    const updatedAt = new Date().toISOString();
    const { error: updateError } = await supabase
      .from("signal_statuses")
      .update({
        status: nextStatus,
        updated_at: updatedAt,
        updated_by: "cron",
      })
      .eq("domino_id", definition.domino_id)
      .eq("signal_name", definition.signal_name);

    if (updateError) {
      errors.push(`Failed to update ${key}: ${updateError.message}`);
      continue;
    }

    const { error: historyError } = await supabase
      .from("signal_history")
      .insert({
        domino_id: definition.domino_id,
        signal_name: definition.signal_name,
        old_status: definition.status,
        new_status: nextStatus,
        trigger_type: "cron",
        reason: `Threshold evaluation from latest value "${latestPoint.value}"`,
      });

    if (historyError) {
      errors.push(
        `Updated ${key}, but history insert failed: ${historyError.message}`,
      );
    }

    changed += 1;
  }

  const nowIso = new Date().toISOString();
  const { data: duePredictions, error: duePredictionsError } = await supabase
    .from("predictions")
    .select(
      "id,signal_id,type,condition,target_date,created_at,scored_at,outcome",
    )
    .is("scored_at", null)
    .is("outcome", null)
    .lte("target_date", nowIso)
    .order("target_date", { ascending: true });

  if (duePredictionsError) {
    errors.push(
      `Failed to fetch pending predictions: ${duePredictionsError.message}`,
    );
  }

  const pendingPredictions = (duePredictions ?? []) as PredictionRow[];

  if (pendingPredictions.length > 0) {
    const predictionSignalIds = [
      ...new Set(
        pendingPredictions
          .map((prediction) => prediction.signal_id)
          .filter((value): value is string => Boolean(value)),
      ),
    ];

    const statusLookupById = new Map<string, SignalStatusLookupRow>();
    if (predictionSignalIds.length > 0) {
      const { data: signalLookupRows, error: signalLookupError } =
        await supabase
          .from("signal_statuses")
          .select("id,domino_id,signal_name")
          .in("id", predictionSignalIds);

      if (signalLookupError) {
        errors.push(
          `Failed to fetch signal lookup for predictions: ${signalLookupError.message}`,
        );
      } else {
        for (const row of (signalLookupRows ?? []) as SignalStatusLookupRow[]) {
          statusLookupById.set(row.id, row);
        }
      }
    }

    for (const prediction of pendingPredictions) {
      if (!hasReachedTargetDate(prediction.target_date)) {
        continue;
      }

      const currentValue = resolvePredictionCurrentValue(
        prediction,
        statusLookupById,
        latestDataPointBySignal,
      );
      const outcome = evaluatePredictionOutcome(prediction, currentValue);
      predictionsEvaluated += 1;

      const { error: scoreError } = await supabase
        .from("predictions")
        .update({
          outcome,
          scored_at: new Date().toISOString(),
        })
        .eq("id", prediction.id)
        .is("scored_at", null);

      if (scoreError) {
        errors.push(
          `Failed to score prediction ${prediction.id}: ${scoreError.message}`,
        );
        continue;
      }

      predictionsScored += 1;
    }
  }

  return jsonResponse({
    evaluated,
    changed,
    predictionsEvaluated,
    predictionsScored,
    errors,
  });
});
