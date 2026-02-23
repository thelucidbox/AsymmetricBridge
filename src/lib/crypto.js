import { withRetry } from "./retry.js";

const COINGECKO_BASE = "https://api.coingecko.com/api/v3";
const CRYPTO_SOURCE = "coingecko";

function createAdapterError(code, message, retryable) {
  return {
    code,
    message,
    retryable,
    source: CRYPTO_SOURCE,
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
      message: error.message || "Unknown CoinGecko error",
      retryable: Boolean(error.retryable),
      source: error.source || CRYPTO_SOURCE,
    };
  }

  if (error instanceof TypeError) {
    return createAdapterError(
      "NETWORK_ERROR",
      "CoinGecko request failed due to a network error",
      true,
    );
  }

  if (error instanceof Error) {
    return createAdapterError("NETWORK_ERROR", error.message, true);
  }

  return createAdapterError("NETWORK_ERROR", "Unknown CoinGecko error", true);
}

function toErrorResult(error, attempts) {
  return {
    data: null,
    error: normalizeAdapterError(error),
    attempts,
  };
}

async function requestStablecoinData() {
  const params = new URLSearchParams({
    vs_currency: "usd",
    ids: "tether,usd-coin,dai",
    order: "market_cap_desc",
  });

  const response = await fetch(
    `${COINGECKO_BASE}/coins/markets?${params.toString()}`,
  );

  if (response.status === 429) {
    throw createAdapterError(
      "RATE_LIMITED",
      "CoinGecko rate limit reached (10-30 requests/minute on free tier)",
      true,
    );
  }

  if (response.status === 401 || response.status === 403) {
    throw createAdapterError(
      "AUTH_ERROR",
      `CoinGecko authentication failed (HTTP ${response.status})`,
      false,
    );
  }

  if (!response.ok) {
    throw createAdapterError(
      "NETWORK_ERROR",
      `CoinGecko API error: ${response.status}`,
      response.status >= 500 || response.status === 408,
    );
  }

  let coins;
  try {
    coins = await response.json();
  } catch {
    throw createAdapterError(
      "INVALID_RESPONSE",
      "CoinGecko returned invalid JSON",
      false,
    );
  }

  if (!Array.isArray(coins)) {
    throw createAdapterError(
      "INVALID_RESPONSE",
      "CoinGecko returned an unexpected response shape",
      false,
    );
  }

  const list = coins;
  const totalMarketCap = list.reduce(
    (sum, coin) => sum + (coin.market_cap || 0),
    0,
  );
  const totalVolume = list.reduce(
    (sum, coin) => sum + (coin.total_volume || 0),
    0,
  );

  return {
    coins: list,
    totalMarketCap,
    totalVolume,
    fetchedAt: new Date().toISOString(),
  };
}

export async function fetchStablecoinData() {
  const result = await withRetry(() => requestStablecoinData(), {
    maxRetries: 3,
    baseDelay: 1000,
    maxDelay: 10000,
    onRetry: ({ attempts, delay, error }) => {
      const normalized = normalizeAdapterError(error);
      console.warn(
        `[crypto] retry ${attempts} in ${delay}ms: ${normalized.message}`,
      );
    },
  });

  if (result.error) {
    return toErrorResult(result.error, result.attempts);
  }

  return result.data;
}
