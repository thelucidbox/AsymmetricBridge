import { useQuery } from "@tanstack/react-query";
import {
  fetchBatchQuotes,
  isMarketOpen,
  TWELVE_DATA_API_KEY,
} from "../lib/stocks";
import { supabase } from "../lib/supabase";

async function cacheStockData(data) {
  if (!supabase) return;

  const { error } = await supabase.from("live_data_cache").upsert(
    {
      data_key: "stocks_batch",
      data,
      fetched_at: new Date().toISOString(),
      ttl_minutes: 15,
    },
    { onConflict: "data_key" },
  );

  if (error) {
    console.warn("Unable to cache stock data in Supabase:", error.message);
  }
}

export function useStockData() {
  return useQuery({
    queryKey: ["stock-quotes"],
    queryFn: async () => {
      const data = await fetchBatchQuotes();
      await cacheStockData(data);
      return data;
    },
    enabled: !!TWELVE_DATA_API_KEY,
    refetchInterval: () => (isMarketOpen() ? 15 * 60 * 1000 : false),
    staleTime: 14 * 60 * 1000,
    retry: 3,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30000),
  });
}
