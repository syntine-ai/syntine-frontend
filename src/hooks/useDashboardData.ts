import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { subDays, startOfDay } from "date-fns";

export type DatePreset = "24h" | "7d" | "30d" | "90d";

function getDateRange(preset: DatePreset): Date {
  const now = new Date();
  switch (preset) {
    case "24h":
      return subDays(now, 1);
    case "7d":
      return subDays(now, 7);
    case "30d":
      return subDays(now, 30);
    case "90d":
      return subDays(now, 90);
    default:
      return subDays(now, 7);
  }
}

interface DashboardMetrics {
  totalCalls: number;
  answeredCalls: number;
  successRate: number;
  avgDuration: number;
  avgSentiment: number;
}

interface Campaign {
  id: string;
  name: string;
  status: string;
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
}

interface CallStats {
  date: string;
  total: number;
  answered: number;
  failed: number;
}

export function useDashboardMetrics(datePreset: DatePreset) {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ["dashboard-metrics", profile?.organization_id, datePreset],
    queryFn: async (): Promise<DashboardMetrics> => {
      if (!profile?.organization_id) {
        return {
          totalCalls: 0,
          answeredCalls: 0,
          successRate: 0,
          avgDuration: 0,
          avgSentiment: 0,
        };
      }

      const startDate = getDateRange(datePreset).toISOString();

      // Fetch calls with outcome data
      const { data: calls, error } = await supabase
        .from("calls")
        .select("outcome, duration_seconds, sentiment_score")
        .eq("organization_id", profile.organization_id)
        .gte("created_at", startDate);

      if (error) throw error;

      const totalCalls = calls?.length || 0;
      const answeredCalls = calls?.filter(c => c.outcome === "answered").length || 0;
      const successRate = totalCalls > 0 ? (answeredCalls / totalCalls) * 100 : 0;
      
      const callsWithDuration = calls?.filter(c => c.duration_seconds != null) || [];
      const avgDuration = callsWithDuration.length > 0
        ? callsWithDuration.reduce((sum, c) => sum + (c.duration_seconds || 0), 0) / callsWithDuration.length
        : 0;

      const callsWithSentiment = calls?.filter(c => c.sentiment_score != null) || [];
      const avgSentiment = callsWithSentiment.length > 0
        ? callsWithSentiment.reduce((sum, c) => sum + (c.sentiment_score || 0), 0) / callsWithSentiment.length
        : 0;

      return {
        totalCalls,
        answeredCalls,
        successRate,
        avgDuration,
        avgSentiment,
      };
    },
    enabled: !!profile?.organization_id,
  });
}

export function useActiveCampaigns() {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ["active-campaigns", profile?.organization_id],
    queryFn: async (): Promise<Campaign[]> => {
      if (!profile?.organization_id) return [];

      const { data, error } = await supabase
        .from("campaigns")
        .select("id, name, status, created_at, started_at, completed_at")
        .eq("organization_id", profile.organization_id)
        .is("deleted_at", null)
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;
      return data || [];
    },
    enabled: !!profile?.organization_id,
  });
}

export function useCampaignCallStats(campaignId: string | null, datePreset: DatePreset) {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ["campaign-call-stats", profile?.organization_id, campaignId, datePreset],
    queryFn: async (): Promise<CallStats[]> => {
      if (!profile?.organization_id) return [];

      const startDate = getDateRange(datePreset);
      
      let query = supabase
        .from("calls")
        .select("created_at, outcome")
        .eq("organization_id", profile.organization_id)
        .gte("created_at", startDate.toISOString());

      if (campaignId) {
        query = query.eq("campaign_id", campaignId);
      }

      const { data: calls, error } = await query;
      if (error) throw error;

      // Group by date
      const statsMap = new Map<string, CallStats>();
      
      calls?.forEach(call => {
        const date = startOfDay(new Date(call.created_at)).toISOString().split("T")[0];
        const existing = statsMap.get(date) || { date, total: 0, answered: 0, failed: 0 };
        
        existing.total++;
        if (call.outcome === "answered") existing.answered++;
        if (call.outcome === "failed") existing.failed++;
        
        statsMap.set(date, existing);
      });

      return Array.from(statsMap.values()).sort((a, b) => a.date.localeCompare(b.date));
    },
    enabled: !!profile?.organization_id,
  });
}

export function useRecentAgents() {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ["recent-agents", profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return [];

      const { data, error } = await supabase
        .from("agents")
        .select("id, name, status, tone, created_at")
        .eq("organization_id", profile.organization_id)
        .is("deleted_at", null)
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) throw error;
      return data || [];
    },
    enabled: !!profile?.organization_id,
  });
}