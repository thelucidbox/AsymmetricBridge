import { useQuery } from "@tanstack/react-query";
import { fetchStablecoinData } from "../lib/crypto";
import { supabase } from "../lib/supabase";

async function cacheCryptoData(data) {
  if (!supabase) return;

  const { error } = await supabase.from("live_data_cache").upsert(
    {
      data_key: "crypto_stablecoins",
      data,
      fetched_at: new Date().toISOString(),
      ttl_minutes: 5,
    },
    { onConflict: "data_key" },
  );

  if (error) {
    console.warn("Unable to cache crypto data in Supabase:", error.message);
  }
}

export function useCryptoData() {
  return useQuery({
    queryKey: ["crypto-stablecoins"],
    queryFn: async () => {
      const data = await fetchStablecoinData();
      await cacheCryptoData(data);
      return data;
    },
    refetchInterval: 5 * 60 * 1000,
    staleTime: 4 * 60 * 1000,
    retry: 3,
  });
}
