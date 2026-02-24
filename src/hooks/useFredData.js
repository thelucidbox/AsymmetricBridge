import { useQuery } from "@tanstack/react-query";
import { fetchAllFredData, getFredApiKey } from "../lib/fred";
import { supabase } from "../lib/supabase";

async function cacheFredData(data) {
  if (!supabase) return;

  const { error } = await supabase.from("live_data_cache").upsert(
    {
      data_key: "fred_all",
      data,
      fetched_at: new Date().toISOString(),
      ttl_minutes: 1440,
    },
    { onConflict: "data_key" },
  );

  if (error) {
    console.warn("Unable to cache FRED data in Supabase:", error.message);
  }
}

export function useFredData() {
  return useQuery({
    queryKey: ["fred-data"],
    queryFn: async () => {
      const data = await fetchAllFredData();
      await cacheFredData(data);
      return data;
    },
    enabled: !!getFredApiKey(),
    staleTime: 24 * 60 * 60 * 1000,
    gcTime: 7 * 24 * 60 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchInterval: false,
  });
}
