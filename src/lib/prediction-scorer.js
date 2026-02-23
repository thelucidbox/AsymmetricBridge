const VALID_OUTCOMES = new Set(["hit", "miss", "partial"]);

function toNumber(value) {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeOutcome(value) {
  const normalized = String(value || "").trim().toLowerCase();
  return VALID_OUTCOMES.has(normalized) ? normalized : null;
}

function normalizeOperator(value) {
  const raw = String(value || "gte").trim().toLowerCase();
  if (raw === ">" || raw === "gt") return "gt";
  if (raw === ">=" || raw === "gte") return "gte";
  if (raw === "<" || raw === "lt") return "lt";
  if (raw === "<=" || raw === "lte") return "lte";
  return "gte";
}

function hasReachedTargetDate(targetDate) {
  const parsed = new Date(targetDate);
  if (Number.isNaN(parsed.getTime())) return false;
  return parsed.getTime() <= Date.now();
}

function readValueFromObject(source, key) {
  if (!source || typeof source !== "object" || !key) return null;
  const direct = source[key];

  if (typeof direct === "number" || typeof direct === "string") {
    return toNumber(direct);
  }

  if (direct && typeof direct === "object") {
    const candidate = direct.value ?? direct.current ?? direct.latest;
    return toNumber(candidate);
  }

  return null;
}

function resolveCurrentValue(prediction, currentData) {
  if (typeof currentData === "number" || typeof currentData === "string") {
    return toNumber(currentData);
  }

  const signalKeys = [
    prediction?.signalId,
    prediction?.signal_id,
    prediction?.condition?.signalId,
    prediction?.condition?.signal_id,
    prediction?.condition?.signalKey,
    prediction?.condition?.signalName,
  ].filter(Boolean);

  if (Array.isArray(currentData)) {
    for (const entry of currentData) {
      const entryKey = entry?.signalId ?? entry?.signal_id ?? entry?.key ?? entry?.name;
      if (!signalKeys.includes(entryKey)) continue;
      const numeric = toNumber(entry?.value ?? entry?.current ?? entry?.latest);
      if (numeric !== null) return numeric;
    }
    return null;
  }

  if (currentData instanceof Map) {
    for (const key of signalKeys) {
      if (!currentData.has(key)) continue;
      const numeric = toNumber(currentData.get(key));
      if (numeric !== null) return numeric;
    }
    return null;
  }

  if (currentData && typeof currentData === "object") {
    for (const key of signalKeys) {
      const numeric = readValueFromObject(currentData, key);
      if (numeric !== null) return numeric;
    }

    if (currentData.values) {
      for (const key of signalKeys) {
        const nested = readValueFromObject(currentData.values, key);
        if (nested !== null) return nested;
      }
    }
  }

  return null;
}

function evaluateThreshold(condition, currentValue) {
  const threshold = toNumber(condition?.threshold);
  if (threshold === null || currentValue === null) return "partial";

  const operator = normalizeOperator(condition?.operator);
  if (operator === "gt") return currentValue > threshold ? "hit" : "miss";
  if (operator === "gte") return currentValue >= threshold ? "hit" : "miss";
  if (operator === "lt") return currentValue < threshold ? "hit" : "miss";
  if (operator === "lte") return currentValue <= threshold ? "hit" : "miss";

  return "partial";
}

function evaluateDirection(condition, currentValue) {
  const baselineValue = toNumber(
    condition?.baselineValue ?? condition?.startValue ?? condition?.valueAtCreation,
  );

  if (baselineValue === null || currentValue === null) return "partial";

  const direction = String(condition?.direction || "").trim().toLowerCase();
  const delta = currentValue - baselineValue;
  if (delta === 0) return "partial";

  if (direction === "up") return delta > 0 ? "hit" : "miss";
  if (direction === "down") return delta < 0 ? "hit" : "miss";
  return "partial";
}

function evaluateRange(condition, currentValue) {
  const min = toNumber(condition?.min);
  const max = toNumber(condition?.max);

  if (min === null || max === null || currentValue === null) return "partial";
  const low = Math.min(min, max);
  const high = Math.max(min, max);

  return currentValue >= low && currentValue <= high ? "hit" : "miss";
}

export function evaluatePrediction(prediction, currentData) {
  if (!prediction) {
    return {
      shouldScore: false,
      outcome: null,
      currentValue: null,
      reason: "Missing prediction",
    };
  }

  if (!hasReachedTargetDate(prediction.targetDate || prediction.target_date)) {
    return {
      shouldScore: false,
      outcome: null,
      currentValue: null,
      reason: "Target date has not been reached",
    };
  }

  const type = String(prediction.type || "").trim().toLowerCase();
  const condition = prediction.condition || {};
  const currentValue = resolveCurrentValue(prediction, currentData);

  if (type === "threshold") {
    return {
      shouldScore: true,
      outcome: evaluateThreshold(condition, currentValue),
      currentValue,
    };
  }

  if (type === "direction") {
    return {
      shouldScore: true,
      outcome: evaluateDirection(condition, currentValue),
      currentValue,
    };
  }

  if (type === "range") {
    return {
      shouldScore: true,
      outcome: evaluateRange(condition, currentValue),
      currentValue,
    };
  }

  return {
    shouldScore: true,
    outcome: "partial",
    currentValue,
    reason: `Unsupported prediction type "${type}"`,
  };
}

export function calculateBattingAverage(predictions) {
  if (!Array.isArray(predictions) || !predictions.length) return 0;

  let total = 0;
  let points = 0;

  for (const prediction of predictions) {
    const outcome = normalizeOutcome(prediction?.outcome);
    if (!outcome) continue;

    total += 1;
    if (outcome === "hit") points += 1;
    if (outcome === "partial") points += 0.5;
  }

  if (total === 0) return 0;
  return points / total;
}
