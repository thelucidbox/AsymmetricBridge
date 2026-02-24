import { withRetry } from "./retry.js";

const TWELVE_DATA_BASE = "https://api.twelvedata.com";

const TWELVE_DATA_KEY_STORAGE = "ab-twelve-data-api-key";

export function getTwelveDataApiKey() {
  const envKey = import.meta.env.VITE_TWELVE_DATA_KEY;
  if (envKey) return envKey;
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem(TWELVE_DATA_KEY_STORAGE) || "";
}

export const TWELVE_DATA_API_KEY = getTwelveDataApiKey();
const STOCK_SOURCE = "twelve_data";

// Tickers -> signal mapping
export const STOCK_SIGNALS = {
  "BX,APO,KKR": {
    domino_id: 5,
    signal_name: "Alt Manager Stock Prices (BX, APO, KKR)",
  },
  "SNOW,NOW,CRM,ZS": {
    domino_id: 1,
    signal_name: "Public SaaS Net Revenue Retention",
  },
};

export const ALL_TICKERS = ["BX", "APO", "KKR", "SNOW", "NOW", "CRM", "ZS"];

function createAdapterError(code, message, retryable) {
  return {
    code,
    message,
    retryable,
    source: STOCK_SOURCE,
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
      message: error.message || "Unknown Twelve Data error",
      retryable: Boolean(error.retryable),
      source: error.source || STOCK_SOURCE,
    };
  }

  if (error instanceof TypeError) {
    return createAdapterError(
      "NETWORK_ERROR",
      "Twelve Data request failed due to a network error",
      true,
    );
  }

  if (error instanceof Error) {
    return createAdapterError("NETWORK_ERROR", error.message, true);
  }

  return createAdapterError("NETWORK_ERROR", "Unknown Twelve Data error", true);
}

function toErrorResult(error, attempts) {
  return {
    data: null,
    error: normalizeAdapterError(error),
    attempts,
  };
}

async function requestBatchQuotes() {
  const apiKey = getTwelveDataApiKey();
  if (!apiKey) {
    throw createAdapterError(
      "AUTH_ERROR",
      "Missing VITE_TWELVE_DATA_KEY",
      false,
    );
  }

  const params = new URLSearchParams({
    symbol: ALL_TICKERS.join(","),
    apikey: apiKey,
  });

  const response = await fetch(
    `${TWELVE_DATA_BASE}/quote?${params.toString()}`,
  );

  if (response.status === 429) {
    throw createAdapterError(
      "RATE_LIMITED",
      "Twelve Data rate limit reached (8 requests/minute, 800/day on free tier)",
      true,
    );
  }

  if (response.status === 401 || response.status === 403) {
    throw createAdapterError(
      "AUTH_ERROR",
      `Twelve Data authentication failed (HTTP ${response.status})`,
      false,
    );
  }

  if (!response.ok) {
    throw createAdapterError(
      "NETWORK_ERROR",
      `Twelve Data API error: ${response.status}`,
      response.status >= 500 || response.status === 408,
    );
  }

  let json;
  try {
    json = await response.json();
  } catch {
    throw createAdapterError(
      "INVALID_RESPONSE",
      "Twelve Data returned invalid JSON",
      false,
    );
  }

  if (!json || typeof json !== "object" || Array.isArray(json)) {
    throw createAdapterError(
      "INVALID_RESPONSE",
      "Twelve Data returned an unexpected response shape",
      false,
    );
  }

  if (json?.code && json?.message) {
    const message = String(json.message);
    const numericCode = Number(json.code);
    const lowerMessage = message.toLowerCase();

    if (numericCode === 429 || lowerMessage.includes("rate limit")) {
      throw createAdapterError("RATE_LIMITED", message, true);
    }

    if (
      numericCode === 401 ||
      numericCode === 403 ||
      lowerMessage.includes("api key") ||
      lowerMessage.includes("unauthorized")
    ) {
      throw createAdapterError("AUTH_ERROR", message, false);
    }

    throw createAdapterError("INVALID_RESPONSE", message, false);
  }

  return json;
}

export async function fetchBatchQuotes() {
  const result = await withRetry(() => requestBatchQuotes(), {
    maxRetries: 3,
    baseDelay: 1000,
    maxDelay: 10000,
    onRetry: ({ attempts, delay, error }) => {
      const normalized = normalizeAdapterError(error);
      console.warn(
        `[stocks] retry ${attempts} in ${delay}ms: ${normalized.message}`,
      );
    },
  });

  if (result.error) {
    return toErrorResult(result.error, result.attempts);
  }

  return result.data;
}

export function isMarketOpen() {
  const now = new Date();
  const easternTime = new Date(
    now.toLocaleString("en-US", { timeZone: "America/New_York" }),
  );

  const day = easternTime.getDay();
  const hour = easternTime.getHours();
  const minute = easternTime.getMinutes();
  const timeNumber = hour * 100 + minute;

  return day >= 1 && day <= 5 && timeNumber >= 930 && timeNumber <= 1600;
}
