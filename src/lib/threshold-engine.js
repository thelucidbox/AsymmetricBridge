import { THRESHOLD_RULES } from "./threshold-rules";
import { supabase } from "./supabase";

// Evaluate a single threshold rule against extracted data
function evaluateThresholds(rule, extracted) {
  if (!extracted || !rule.thresholds?.length) return null;

  for (const threshold of rule.thresholds) {
    let matches = false;

    if (
      threshold.operator === "custom" &&
      typeof threshold.test === "function"
    ) {
      matches = threshold.test(extracted);
    } else if (threshold.operator === "<") {
      matches = extracted.value < threshold.value;
    } else if (threshold.operator === ">") {
      matches = extracted.value > threshold.value;
    } else if (threshold.operator === "<=") {
      matches = extracted.value <= threshold.value;
    } else if (threshold.operator === ">=") {
      matches = extracted.value >= threshold.value;
    } else if (threshold.operator === "==") {
      matches = extracted.value === threshold.value;
    }

    if (matches) {
      return { status: threshold.status, reason: threshold.reason };
    }
  }

  // No threshold matched — baseline (green)
  return { status: "green", reason: "All thresholds within baseline" };
}

// Run the full evaluation across all signals given live data
export function evaluateAllSignals({ fredData, stockData, cryptoData }) {
  const results = [];

  for (const rule of THRESHOLD_RULES) {
    if (rule.manual_only) {
      results.push({
        domino_id: rule.domino_id,
        signal_name: rule.signal_name,
        manual_only: true,
        evaluated: false,
      });
      continue;
    }

    // Select the right data source
    let sourceData;
    if (rule.data_source === "fred") sourceData = fredData;
    else if (rule.data_source === "stocks") sourceData = stockData;
    else if (rule.data_source === "crypto") sourceData = cryptoData;

    if (!sourceData) {
      results.push({
        domino_id: rule.domino_id,
        signal_name: rule.signal_name,
        evaluated: false,
        reason: `No ${rule.data_source} data available`,
      });
      continue;
    }

    // Extract the value
    const extracted = rule.extract(sourceData);
    if (!extracted) {
      results.push({
        domino_id: rule.domino_id,
        signal_name: rule.signal_name,
        evaluated: false,
        reason: "Could not extract value from data",
      });
      continue;
    }

    // Evaluate against thresholds
    const evaluation = evaluateThresholds(rule, extracted);
    if (!evaluation) {
      results.push({
        domino_id: rule.domino_id,
        signal_name: rule.signal_name,
        evaluated: false,
        extracted,
        reason: "No thresholds defined for auto-evaluation",
      });
      continue;
    }

    results.push({
      domino_id: rule.domino_id,
      signal_name: rule.signal_name,
      evaluated: true,
      extracted,
      newStatus: evaluation.status,
      reason: evaluation.reason,
    });
  }

  return results;
}

// Apply evaluation results to Supabase — respects manual overrides
export async function applyEvaluationResults(results, currentStatuses) {
  if (!supabase) return { applied: 0, skipped: 0, errors: [] };

  const changes = [];
  const errors = [];
  let skipped = 0;

  for (const result of results) {
    if (!result.evaluated || !result.newStatus) {
      skipped++;
      continue;
    }

    // Find current status
    const current = currentStatuses?.find(
      (s) =>
        s.domino_id === result.domino_id &&
        s.signal_name === result.signal_name,
    );

    if (!current) {
      skipped++;
      continue;
    }

    // Skip if manually overridden
    if (current.is_override) {
      skipped++;
      continue;
    }

    // Skip if status hasn't changed
    if (current.status === result.newStatus) {
      skipped++;
      continue;
    }

    // Check idempotency — skip if updated within last 5 minutes
    const lastUpdate = new Date(current.updated_at);
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);
    if (lastUpdate > fiveMinAgo) {
      skipped++;
      continue;
    }

    changes.push({
      domino_id: result.domino_id,
      signal_name: result.signal_name,
      old_status: current.status,
      new_status: result.newStatus,
      reason: `${result.reason} (${result.extracted?.label || ""})`,
    });
  }

  // Apply changes in batch
  for (const change of changes) {
    try {
      // Update status
      const { error: updateErr } = await supabase
        .from("signal_statuses")
        .update({
          status: change.new_status,
          updated_at: new Date().toISOString(),
          updated_by: "auto-threshold",
        })
        .eq("domino_id", change.domino_id)
        .eq("signal_name", change.signal_name)
        .eq("is_override", false); // Extra safety: never overwrite manual

      if (updateErr) throw updateErr;

      // Write history
      const { error: histErr } = await supabase.from("signal_history").insert({
        domino_id: change.domino_id,
        signal_name: change.signal_name,
        old_status: change.old_status,
        new_status: change.new_status,
        trigger_type: "auto",
        reason: change.reason,
      });

      if (histErr) throw histErr;
    } catch (err) {
      errors.push({ change, error: err.message });
    }
  }

  return {
    applied: changes.length - errors.length,
    skipped,
    errors,
    changes,
  };
}
