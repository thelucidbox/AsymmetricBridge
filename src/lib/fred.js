const FRED_BASE = "https://api.stlouisfed.org/fred/series/observations";

export const FRED_API_KEY = import.meta.env.VITE_FRED_API_KEY;

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

export async function fetchFredSeries(seriesId) {
  if (!FRED_API_KEY) {
    throw new Error("Missing VITE_FRED_API_KEY");
  }

  const params = new URLSearchParams({
    series_id: seriesId,
    api_key: FRED_API_KEY,
    file_type: "json",
    sort_order: "desc",
    limit: "5",
  });

  const response = await fetch(`${FRED_BASE}?${params.toString()}`);
  if (!response.ok) {
    throw new Error(`FRED API error: ${response.status}`);
  }

  const json = await response.json();
  return json.observations ?? [];
}

export async function fetchAllFredData() {
  const seriesIds = Object.keys(FRED_SIGNALS);
  const results = await Promise.all(
    seriesIds.map(async (seriesId) => {
      try {
        const observations = await fetchFredSeries(seriesId);
        return [
          seriesId,
          {
            observations,
            signal: FRED_SIGNALS[seriesId],
            fetchedAt: new Date().toISOString(),
          },
        ];
      } catch (error) {
        console.error(`FRED fetch failed for ${seriesId}:`, error);
        return [
          seriesId,
          {
            error: error instanceof Error ? error.message : "Unknown FRED error",
            signal: FRED_SIGNALS[seriesId],
          },
        ];
      }
    }),
  );

  return Object.fromEntries(results);
}
