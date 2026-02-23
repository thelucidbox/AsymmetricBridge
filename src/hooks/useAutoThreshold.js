import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  evaluateAllSignals,
  applyEvaluationResults,
} from "../lib/threshold-engine";
import { supabase } from "../lib/supabase";

export function useAutoThreshold({
  fredData,
  stockData,
  cryptoData,
  signalStatuses,
}) {
  const queryClient = useQueryClient();
  const lastRunRef = useRef(0);
  const [lastResult, setLastResult] = useState(null);

  useEffect(() => {
    // Don't run if no data or no statuses
    if (!signalStatuses) return;
    if (!fredData && !stockData && !cryptoData) return;
    if (!supabase) return;

    // Debounce: don't run more than once per 30 seconds
    const now = Date.now();
    if (now - lastRunRef.current < 30 * 1000) return;
    lastRunRef.current = now;

    async function runEvaluation() {
      // Evaluate all signals against live data
      const results = evaluateAllSignals({ fredData, stockData, cryptoData });

      // Apply changes to Supabase (respects overrides + idempotency)
      const outcome = await applyEvaluationResults(results, signalStatuses);

      setLastResult({
        timestamp: new Date().toISOString(),
        ...outcome,
        evaluated: results.filter((r) => r.evaluated).length,
        manualOnly: results.filter((r) => r.manual_only).length,
      });

      // If any changes were applied, invalidate signal queries
      if (outcome.applied > 0) {
        queryClient.invalidateQueries({ queryKey: ["signal-statuses"] });
        queryClient.invalidateQueries({ queryKey: ["signal-history"] });
      }
    }

    runEvaluation();
  }, [fredData, stockData, cryptoData, signalStatuses, queryClient]);

  return lastResult;
}
