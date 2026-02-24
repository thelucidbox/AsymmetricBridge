import { withRetry } from "./retry.js";

const FRED_BASE = "https://api.stlouisfed.org/fred/series/observations";

const FRED_KEY_STORAGE = "ab-fred-api-key";

export function getFredApiKey() {
  const envKey = import.meta.env.VITE_FRED_API_KEY;
  if (envKey) return envKey;
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem(FRED_KEY_STORAGE) || "";
}

export const FRED_API_KEY = getFredApiKey();
const FRED_SOURCE = "fred";

// FRED series -> signal mapping
export const FRED_SIGNALS = {
  M2V: { domino_id: 4, signal_name: "M2 Velocity of Money" },
  PRS85006173: { domino_id: 4, signal_name: "Labor Share of GDP" },
  GDP: { domino_id: 4, signal_name: "GDP Growth vs. Real Wage Growth Spread" },
  JTS540099000000000JOL: {
    domino_id: 2,
    signal_name: "JOLTS: Professional Services Openings",
  },
  ICSA: {
    domino_id: 2,
    signal_name: "Initial Jobless Claims Composition",
  },
  CES5000000001: {
    domino_id: 2,
    signal_name: "BLS Employment: Information Sector",
  },
  CSCICP03USM665S: {
    domino_id: 4,
    signal_name: "Consumer Confidence vs. CEO Confidence",
  },
  FGRECPT: {
    domino_id: 6,
    signal_name: "Federal Receipts vs. CBO Baseline",
  },
};

function createAdapterError(code, message, retryable) {
  return {
    code,
    message,
    retryable,
    source: FRED_SOURCE,
  };
}

function normalizeAdapterError(error) {
  if (
    error &&
    typeof error === "object" &&
    "code" in error &&
    "message" in error
  ) {
    return {
      code: error.code || "NETWORK_ERROR",
      message: error.message || "Unknown FRED error",
      retryable: Boolean(error.retryable),
      source: error.source || FRED_SOURCE,
    };
  }

  if (error instanceof TypeError) {
    return createAdapterError(
      "NETWORK_ERROR",
      "FRED request failed due to a network error",
      true,
    );
  }

  if (error instanceof Error) {
    return createAdapterError("NETWORK_ERROR", error.message, true);
  }

  return createAdapterError("NETWORK_ERROR", "Unknown FRED error", true);
}

function toErrorResult(error, attempts) {
  return {
    data: null,
    error: normalizeAdapterError(error),
    attempts,
  };
}

function isErrorResult(value) {
  return (
    Boolean(value) &&
    typeof value === "object" &&
    "data" in value &&
    "error" in value &&
    "attempts" in value
  );
}

async function requestFredSeries(seriesId) {
  const apiKey = getFredApiKey();
  if (!apiKey) {
    throw createAdapterError("AUTH_ERROR", "Missing VITE_FRED_API_KEY", false);
  }

  const params = new URLSearchParams({
    series_id: seriesId,
    api_key: apiKey,
    file_type: "json",
    sort_order: "desc",
    limit: "5",
  });

  const response = await fetch(`${FRED_BASE}?${params.toString()}`);

  if (response.status === 429) {
    throw createAdapterError(
      "RATE_LIMITED",
      "FRED rate limit reached (120 requests/minute)",
      true,
    );
  }

  if (response.status === 401 || response.status === 403) {
    throw createAdapterError(
      "AUTH_ERROR",
      `FRED authentication failed (HTTP ${response.status})`,
      false,
    );
  }

  if (!response.ok) {
    throw createAdapterError(
      "NETWORK_ERROR",
      `FRED API error: ${response.status}`,
      response.status >= 500 || response.status === 408,
    );
  }

  let json;
  try {
    json = await response.json();
  } catch {
    throw createAdapterError(
      "INVALID_RESPONSE",
      "FRED returned invalid JSON",
      false,
    );
  }

  if (!Array.isArray(json?.observations)) {
    throw createAdapterError(
      "INVALID_RESPONSE",
      "FRED response missing observations array",
      false,
    );
  }

  return json.observations;
}

export async function fetchFredSeries(seriesId) {
  const result = await withRetry(() => requestFredSeries(seriesId), {
    maxRetries: 3,
    baseDelay: 1000,
    maxDelay: 10000,
    onRetry: ({ attempts, delay, error }) => {
      const normalized = normalizeAdapterError(error);
      console.warn(
        `[fred] retry ${attempts} in ${delay}ms: ${normalized.message}`,
      );
    },
  });

  if (result.error) {
    return toErrorResult(result.error, result.attempts);
  }

  return result.data;
}

export async function fetchAllFredData() {
  if (!getFredApiKey()) {
    return toErrorResult(
      createAdapterError("AUTH_ERROR", "Missing VITE_FRED_API_KEY", false),
      0,
    );
  }

  const seriesIds = Object.keys(FRED_SIGNALS);
  const results = await Promise.all(
    seriesIds.map(async (seriesId) => {
      const observations = await fetchFredSeries(seriesId);

      if (isErrorResult(observations)) {
        console.error(`FRED fetch failed for ${seriesId}:`, observations.error);
        return [
          seriesId,
          {
            data: null,
            error: observations.error,
            attempts: observations.attempts,
            signal: FRED_SIGNALS[seriesId],
          },
        ];
      }

      return [
        seriesId,
        {
          observations,
          signal: FRED_SIGNALS[seriesId],
          fetchedAt: new Date().toISOString(),
        },
      ];
    }),
  );

  return Object.fromEntries(results);
}
