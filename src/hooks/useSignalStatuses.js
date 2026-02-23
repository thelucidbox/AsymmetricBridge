import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";

export function useSignalStatuses() {
  return useQuery({
    queryKey: ["signal-statuses"],
    queryFn: async () => {
      if (!supabase) return null;
      const { data, error } = await supabase
        .from("signal_statuses")
        .select("*")
        .order("domino_id");
      if (error) throw error;
      return data;
    },
    staleTime: 60 * 1000,
    refetchInterval: 60 * 1000,
    enabled: !!supabase,
  });
}

export function useSignalHistory(dominoId, signalName) {
  return useQuery({
    queryKey: ["signal-history", dominoId, signalName],
    queryFn: async () => {
      if (!supabase) return [];
      let query = supabase
        .from("signal_history")
        .select("*")
        .order("changed_at", { ascending: false })
        .limit(10);

      if (dominoId) query = query.eq("domino_id", dominoId);
      if (signalName) query = query.eq("signal_name", signalName);

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    staleTime: 30 * 1000,
    enabled: !!supabase,
  });
}

export function useUpdateSignalStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      dominoId,
      signalName,
      newStatus,
      reason,
      triggerType = "manual",
    }) => {
      if (!supabase) throw new Error("Supabase not configured");

      // Get current status for history
      const { data: current } = await supabase
        .from("signal_statuses")
        .select("status")
        .eq("domino_id", dominoId)
        .eq("signal_name", signalName)
        .single();

      const oldStatus = current?.status || "green";

      if (oldStatus === newStatus) return { skipped: true };

      // Update status
      const { error: updateError } = await supabase
        .from("signal_statuses")
        .update({
          status: newStatus,
          is_override: triggerType === "manual",
          updated_at: new Date().toISOString(),
          updated_by: triggerType === "manual" ? "claude-code" : "system",
        })
        .eq("domino_id", dominoId)
        .eq("signal_name", signalName);

      if (updateError) throw updateError;

      // Write history
      const { error: historyError } = await supabase
        .from("signal_history")
        .insert({
          domino_id: dominoId,
          signal_name: signalName,
          old_status: oldStatus,
          new_status: newStatus,
          trigger_type: triggerType,
          reason: reason || null,
        });

      if (historyError) throw historyError;

      return { oldStatus, newStatus };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["signal-statuses"] });
      queryClient.invalidateQueries({ queryKey: ["signal-history"] });
    },
  });
}

export function useAssessments() {
  return useQuery({
    queryKey: ["assessments"],
    queryFn: async () => {
      if (!supabase) return null;
      const { data, error } = await supabase.from("assessments").select("*");
      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60 * 1000,
    enabled: !!supabase,
  });
}
