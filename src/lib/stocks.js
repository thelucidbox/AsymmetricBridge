const TWELVE_DATA_BASE = "https://api.twelvedata.com";

export const TWELVE_DATA_API_KEY = import.meta.env.VITE_TWELVE_DATA_KEY;

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

export async function fetchBatchQuotes() {
  if (!TWELVE_DATA_API_KEY) {
    throw new Error("Missing VITE_TWELVE_DATA_KEY");
  }

  const params = new URLSearchParams({
    symbol: ALL_TICKERS.join(","),
    apikey: TWELVE_DATA_API_KEY,
  });

  const response = await fetch(`${TWELVE_DATA_BASE}/quote?${params.toString()}`);
  if (!response.ok) {
    throw new Error(`Twelve Data API error: ${response.status}`);
  }

  const json = await response.json();
  if (json?.code && json?.message) {
    throw new Error(`Twelve Data API error: ${json.message}`);
  }

  return json;
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
