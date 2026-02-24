import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  evaluateAllSignals,
  applyEvaluationResults,
} from "../lib/threshold-engine";
import { supabase } from "../lib/supabase";
import { useAuth } from "../lib/AuthContext";

// Persist extracted values to signal_data_points so the server-side cron
// can evaluate thresholds even when the dashboard isn't open
async function persistDataPoints(results) {
  if (!supabase) return;

  const rows = results
    .filter((r) => r.evaluated && r.extracted)
    .map((r) => ({
      domino_id: r.domino_id,
      signal_name: r.signal_name,
      date: new Date().toISOString().slice(0, 10),
      value: String(r.extracted.value),
      status: r.newStatus || "green",
      source: "live-feed",
    }));

  if (rows.length === 0) return;

  const { error } = await supabase.from("signal_data_points").upsert(rows, {
    onConflict: "domino_id,signal_name,date",
    ignoreDuplicates: false,
  });

  if (error) {
    console.warn("Unable to persist data points:", error.message);
  }
}

export function useAutoThreshold({
  fredData,
  stockData,
  cryptoData,
  signalStatuses,
}) {
  const queryClient = useQueryClient();
  const { userId } = useAuth();
  const lastRunRef = useRef(0);
  const [lastResult, setLastResult] = useState(null);

  useEffect(() => {
    if (!signalStatuses) return;
    if (!fredData && !stockData && !cryptoData) return;
    if (!supabase) return;

    // Debounce: don't run more than once per 30 seconds
    const now = Date.now();
    if (now - lastRunRef.current < 30 * 1000) return;
    lastRunRef.current = now;

    async function runEvaluation() {
      const results = evaluateAllSignals({ fredData, stockData, cryptoData });

      // Persist extracted values so server-side cron has fresh data
      await persistDataPoints(results);

      // Apply status changes to Supabase (respects overrides + idempotency)
      const outcome = await applyEvaluationResults(
        results,
        signalStatuses,
        userId,
      );

      setLastResult({
        timestamp: new Date().toISOString(),
        ...outcome,
        evaluated: results.filter((r) => r.evaluated).length,
        manualOnly: results.filter((r) => r.manual_only).length,
      });

      if (outcome.applied > 0) {
        queryClient.invalidateQueries({ queryKey: ["signal-statuses"] });
        queryClient.invalidateQueries({ queryKey: ["signal-history"] });
      }
    }

    runEvaluation();
  }, [fredData, stockData, cryptoData, signalStatuses, queryClient, userId]);

  return lastResult;
}
