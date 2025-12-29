import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type Call = Database["public"]["Tables"]["calls"]["Row"];
type CallTranscript = Database["public"]["Tables"]["call_transcripts"]["Row"];

export interface CallLogWithDetails extends Call {
  agent_name?: string;
  campaign_name?: string;
  contact_name?: string;
  transcripts?: CallTranscript[];
}

export function useCallLogs() {
  const { profile } = useAuth();
  const [calls, setCalls] = useState<CallLogWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCalls = useCallback(async () => {
    if (!profile?.organization_id) return;

    try {
      setIsLoading(true);
      setError(null);

      const { data: callsData, error: callsError } = await supabase
        .from("calls")
        .select(`
          *,
          agents:agent_id(name),
          campaigns:campaign_id(name),
          contacts:contact_id(first_name, last_name)
        `)
        .eq("organization_id", profile.organization_id)
        .order("created_at", { ascending: false })
        .limit(100);

      if (callsError) throw callsError;

      const callsWithDetails: CallLogWithDetails[] = (callsData || []).map((call: any) => ({
        ...call,
        agent_name: call.agents?.name || "Unknown Agent",
        campaign_name: call.campaigns?.name || "Direct Call",
        contact_name: call.contacts 
          ? `${call.contacts.first_name || ""} ${call.contacts.last_name || ""}`.trim() || "Unknown"
          : "Unknown",
      }));

      setCalls(callsWithDetails);
    } catch (err: any) {
      console.error("Error fetching calls:", err);
      setError(err.message);
      toast.error("Failed to load call logs");
    } finally {
      setIsLoading(false);
    }
  }, [profile?.organization_id]);

  const fetchTranscript = useCallback(async (callId: string): Promise<CallTranscript[]> => {
    try {
      const { data, error } = await supabase
        .from("call_transcripts")
        .select("*")
        .eq("call_id", callId)
        .order("sequence", { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (err: any) {
      console.error("Error fetching transcript:", err);
      toast.error("Failed to load transcript");
      return [];
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    if (profile?.organization_id) {
      fetchCalls();
    }
  }, [profile?.organization_id, fetchCalls]);

  // Real-time subscription
  useEffect(() => {
    if (!profile?.organization_id) return;

    const channel = supabase
      .channel("calls-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "calls",
          filter: `organization_id=eq.${profile.organization_id}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            // Fetch the full call with relations
            fetchCalls();
          } else if (payload.eventType === "UPDATE") {
            setCalls((prev) =>
              prev.map((call) =>
                call.id === payload.new.id ? { ...call, ...payload.new } : call
              )
            );
          } else if (payload.eventType === "DELETE") {
            setCalls((prev) => prev.filter((call) => call.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile?.organization_id, fetchCalls]);

  return {
    calls,
    isLoading,
    error,
    fetchTranscript,
    refetch: fetchCalls,
  };
}
