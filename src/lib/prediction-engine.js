const VALID_TYPES = new Set(["threshold", "direction", "range"]);
const VALID_OUTCOMES = new Set(["hit", "miss", "partial"]);
export const PREDICTIONS_STORAGE_KEY = "ab-conviction-predictions";

function createId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `pred-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function toNumber(value) {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeOperator(value) {
  const raw = String(value || "gte").trim().toLowerCase();

  if (raw === ">" || raw === "gt") return "gt";
  if (raw === ">=" || raw === "gte") return "gte";
  if (raw === "<" || raw === "lt") return "lt";
  if (raw === "<=" || raw === "lte") return "lte";
  return "gte";
}

function normalizeTemplateType(template) {
  const raw = typeof template === "string"
    ? template
    : template?.id || template?.type || "";
  const normalized = String(raw).trim().toLowerCase();

  if (!VALID_TYPES.has(normalized)) {
    throw new Error(`Unsupported prediction template: "${raw}"`);
  }

  return normalized;
}

function normalizeTargetDate(value) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error("Invalid target date");
  }

  return parsed.toISOString();
}

function normalizeSignalId(params) {
  const raw = params?.signalId ?? params?.signal_id ?? null;
  if (raw === null || raw === undefined || raw === "") return null;
  return String(raw);
}

function buildCondition(type, params) {
  const base = {
    signalName: params?.signalName || null,
    dominoId: params?.dominoId ?? null,
  };

  if (type === "threshold") {
    const threshold = toNumber(params?.threshold);
    if (threshold === null) {
      throw new Error("Threshold predictions require a numeric threshold value");
    }

    return {
      ...base,
      operator: normalizeOperator(params?.operator),
      threshold,
    };
  }

  if (type === "direction") {
    const direction = String(params?.direction || "").trim().toLowerCase();
    if (direction !== "up" && direction !== "down") {
      throw new Error('Direction predictions require direction "up" or "down"');
    }

    return {
      ...base,
      direction,
      baselineValue: toNumber(
        params?.baselineValue ?? params?.startValue ?? params?.valueAtCreation,
      ),
    };
  }

  const min = toNumber(params?.min);
  const max = toNumber(params?.max);
  if (min === null || max === null) {
    throw new Error("Range predictions require numeric min and max values");
  }

  return {
    ...base,
    min: Math.min(min, max),
    max: Math.max(min, max),
  };
}

function safeReadStorage() {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(PREDICTIONS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function safeWriteStorage(predictions) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(PREDICTIONS_STORAGE_KEY, JSON.stringify(predictions));
  } catch {
    // Ignore localStorage write failures in private/restricted mode.
  }
}

function normalizeOutcome(value) {
  const normalized = value == null ? null : String(value).trim().toLowerCase();
  return VALID_OUTCOMES.has(normalized) ? normalized : null;
}

function normalizePrediction(prediction) {
  const outcome = normalizeOutcome(prediction?.outcome);
  const status = outcome || prediction?.scoredAt || prediction?.scored_at ? "scored" : "pending";

  return {
    id: prediction?.id || createId(),
    type: normalizeTemplateType(prediction?.type || "threshold"),
    signalId: prediction?.signalId ?? prediction?.signal_id ?? null,
    signalName: prediction?.signalName ?? prediction?.condition?.signalName ?? null,
    dominoId: prediction?.dominoId ?? prediction?.condition?.dominoId ?? null,
    condition: prediction?.condition || {},
    targetDate: normalizeTargetDate(prediction?.targetDate ?? prediction?.target_date),
    createdAt: normalizeTargetDate(prediction?.createdAt ?? prediction?.created_at ?? new Date()),
    scoredAt: prediction?.scoredAt ?? prediction?.scored_at ?? null,
    status,
    outcome,
    notes: prediction?.notes || null,
  };
}

export function readStoredPredictions() {
  return safeReadStorage()
    .map((prediction) => {
      try {
        return normalizePrediction(prediction);
      } catch {
        return null;
      }
    })
    .filter(Boolean);
}

export function writeStoredPredictions(predictions) {
  safeWriteStorage(predictions);
}

export function createPrediction(template, params = {}) {
  const type = normalizeTemplateType(template);
  const signalId = normalizeSignalId(params);
  const createdAt = new Date().toISOString();

  if (!params?.targetDate) {
    throw new Error("Predictions require a target date");
  }

  return {
    id: createId(),
    type,
    signalId,
    signalName: params?.signalName || null,
    dominoId: params?.dominoId ?? null,
    condition: buildCondition(type, params),
    targetDate: normalizeTargetDate(params.targetDate),
    createdAt,
    scoredAt: null,
    status: "pending",
    outcome: null,
    notes: params?.notes || null,
  };
}

export function getPendingPredictions(predictions) {
  const source = Array.isArray(predictions) ? predictions : readStoredPredictions();

  return source
    .map((prediction) => {
      try {
        return normalizePrediction(prediction);
      } catch {
        return null;
      }
    })
    .filter(Boolean)
    .filter((prediction) => prediction.status === "pending")
    .sort((a, b) => new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime());
}

export function scorePrediction(id, outcome, predictions) {
  const normalizedOutcome = normalizeOutcome(outcome);
  if (!normalizedOutcome) {
    throw new Error(`Invalid prediction outcome: "${outcome}"`);
  }

  const source = Array.isArray(predictions) ? predictions : readStoredPredictions();
  const scoredAt = new Date().toISOString();
  let updatedPrediction = null;

  const next = source.map((prediction) => {
    if (prediction.id !== id) return prediction;

    updatedPrediction = {
      ...prediction,
      status: "scored",
      outcome: normalizedOutcome,
      scoredAt,
    };

    return updatedPrediction;
  });

  if (!Array.isArray(predictions)) {
    writeStoredPredictions(next);
  }

  return updatedPrediction;
}
