import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import type { Database } from "@/integrations/supabase/types";

type Campaign = Database["public"]["Tables"]["campaigns"]["Row"];
type CampaignInsert = Database["public"]["Tables"]["campaigns"]["Insert"];
type CampaignUpdate = Database["public"]["Tables"]["campaigns"]["Update"];
type CampaignStatus = Database["public"]["Enums"]["campaign_status"];

export interface CampaignWithDetails extends Campaign {
  agents: Array<{ id: string; name: string; is_primary: boolean }>;
  contactLists: Array<{ id: string; name: string; contactCount: number }>;
  callsToday: number;
  successRate: number;
}

// Demo contact lists data (until contact_lists tables are created)
const demoContactLists = [
  { id: "list-1", name: "VIP Customers", contactCount: 156 },
  { id: "list-2", name: "Recent Orders", contactCount: 423 },
  { id: "list-3", name: "Cart Abandoners", contactCount: 89 },
];

export function useCampaigns() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [campaigns, setCampaigns] = useState<CampaignWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCampaigns = useCallback(async () => {
    if (!profile?.organization_id) return;

    try {
      setIsLoading(true);
      setError(null);

      // Fetch campaigns
      const { data: campaignsData, error: campaignsError } = await supabase
        .from("campaigns")
        .select("*")
        .eq("organization_id", profile.organization_id)
        .is("deleted_at", null)
        .order("updated_at", { ascending: false });

      if (campaignsError) throw campaignsError;

      if (!campaignsData || campaignsData.length === 0) {
        setCampaigns([]);
        setIsLoading(false);
        return;
      }

      const campaignIds = campaignsData.map((c) => c.id);

      // Fetch campaign agents with agent names
      const { data: campaignAgents } = await supabase
        .from("campaign_agents")
        .select("campaign_id, agent_id, is_primary, agents(id, name)")
        .in("campaign_id", campaignIds);

      // Fetch today's call stats per campaign
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const { data: todayCalls } = await supabase
        .from("calls")
        .select("campaign_id, outcome")
        .eq("organization_id", profile.organization_id)
        .in("campaign_id", campaignIds)
        .gte("created_at", todayStart.toISOString());

      // Calculate stats per campaign
      const callStats: Record<string, { total: number; answered: number }> = {};
      todayCalls?.forEach((call) => {
        if (!call.campaign_id) return;
        if (!callStats[call.campaign_id]) {
          callStats[call.campaign_id] = { total: 0, answered: 0 };
        }
        callStats[call.campaign_id].total++;
        if (call.outcome === "answered") {
          callStats[call.campaign_id].answered++;
        }
      });

      // Build campaign details
      const campaignsWithDetails: CampaignWithDetails[] = campaignsData.map((campaign) => {
        const agents = (campaignAgents || [])
          .filter((ca) => ca.campaign_id === campaign.id)
          .map((ca) => ({
            id: ca.agent_id,
            name: (ca.agents as any)?.name || "Unknown",
            is_primary: ca.is_primary || false,
          }));

        // Using demo contact lists for now
        const contactLists: Array<{ id: string; name: string; contactCount: number }> = [];

        const stats = callStats[campaign.id] || { total: 0, answered: 0 };
        const successRate = stats.total > 0 ? (stats.answered / stats.total) * 100 : 0;

        return {
          ...campaign,
          agents,
          contactLists,
          callsToday: stats.total,
          successRate,
        };
      });

      setCampaigns(campaignsWithDetails);
    } catch (err) {
      console.error("Error fetching campaigns:", err);
      setError("Failed to fetch campaigns");
      toast({
        title: "Error",
        description: "Failed to fetch campaigns",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [profile?.organization_id, toast]);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  const createCampaign = async (data: {
    name: string;
    description?: string;
    concurrency?: number;
    agentIds?: string[];
    contactListIds?: string[];
    campaign_type?: string;
    auto_trigger_enabled?: boolean;
    max_retry_attempts?: number;
    retry_delay_minutes?: number;
  }) => {
    if (!profile?.organization_id) {
      toast({
        title: "Error",
        description: "You must be logged in to create a campaign",
        variant: "destructive",
      });
      return null;
    }

    try {
      const campaignData: CampaignInsert = {
        organization_id: profile.organization_id,
        name: data.name,
        description: data.description || null,
        concurrency: data.concurrency || 1,
        status: "draft",
        campaign_type: data.campaign_type || "outbound",
        auto_trigger_enabled: data.auto_trigger_enabled || false,
        max_retry_attempts: data.max_retry_attempts || 3,
        retry_delay_minutes: data.retry_delay_minutes || 60,
      };

      const { data: newCampaign, error } = await supabase
        .from("campaigns")
        .insert(campaignData)
        .select()
        .single();

      if (error) throw error;

      // Link agents
      if (data.agentIds && data.agentIds.length > 0) {
        const agentLinks = data.agentIds.map((agentId, index) => ({
          campaign_id: newCampaign.id,
          agent_id: agentId,
          is_primary: index === 0,
        }));

        await supabase.from("campaign_agents").insert(agentLinks);
      }

      // Contact list linking would go here once tables exist

      await fetchCampaigns();

      toast({
        title: "Campaign Created",
        description: `"${data.name}" has been created successfully.`,
      });

      return newCampaign;
    } catch (err) {
      console.error("Error creating campaign:", err);
      toast({
        title: "Error",
        description: "Failed to create campaign",
        variant: "destructive",
      });
      return null;
    }
  };

  const updateCampaign = async (id: string, data: Partial<CampaignUpdate>) => {
    try {
      const { data: updatedCampaign, error } = await supabase
        .from("campaigns")
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      setCampaigns((prev) =>
        prev.map((campaign) =>
          campaign.id === id ? { ...campaign, ...updatedCampaign } : campaign
        )
      );

      toast({
        title: "Campaign Updated",
        description: "Campaign has been updated successfully.",
      });

      return updatedCampaign;
    } catch (err) {
      console.error("Error updating campaign:", err);
      toast({
        title: "Error",
        description: "Failed to update campaign",
        variant: "destructive",
      });
      return null;
    }
  };

  const updateCampaignStatus = async (id: string, status: CampaignStatus) => {
    const updates: Partial<CampaignUpdate> = { status };

    if (status === "running") {
      updates.started_at = new Date().toISOString();
    } else if (status === "completed" || status === "cancelled") {
      updates.completed_at = new Date().toISOString();
    }

    const result = await updateCampaign(id, updates);

    if (result) {
      toast({
        title: status === "running" ? "Campaign Started" :
          status === "paused" ? "Campaign Paused" :
            `Campaign ${status.charAt(0).toUpperCase() + status.slice(1)}`,
        description: `Campaign is now ${status}.`,
      });
    }

    return result;
  };

  const deleteCampaign = async (id: string) => {
    try {
      const { error } = await supabase
        .from("campaigns")
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", id);

      if (error) throw error;

      setCampaigns((prev) => prev.filter((c) => c.id !== id));

      toast({
        title: "Campaign Deleted",
        description: "The campaign has been removed.",
        variant: "destructive",
      });

      return true;
    } catch (err) {
      console.error("Error deleting campaign:", err);
      toast({
        title: "Error",
        description: "Failed to delete campaign",
        variant: "destructive",
      });
      return false;
    }
  };

  const linkAgent = async (campaignId: string, agentId: string, isPrimary = false) => {
    try {
      const { error } = await supabase.from("campaign_agents").insert({
        campaign_id: campaignId,
        agent_id: agentId,
        is_primary: isPrimary,
      });

      if (error) {
        if (error.message.includes("duplicate")) {
          toast({ title: "Agent already linked", description: "This agent is already assigned to the campaign." });
          return false;
        }
        throw error;
      }

      await fetchCampaigns();
      toast({ title: "Agent Linked", description: "Agent has been added to the campaign." });
      return true;
    } catch (err) {
      console.error("Error linking agent:", err);
      toast({ title: "Error", description: "Failed to link agent", variant: "destructive" });
      return false;
    }
  };

  const unlinkAgent = async (campaignId: string, agentId: string) => {
    try {
      const { error } = await supabase
        .from("campaign_agents")
        .delete()
        .eq("campaign_id", campaignId)
        .eq("agent_id", agentId);

      if (error) throw error;

      await fetchCampaigns();
      toast({ title: "Agent Removed", description: "Agent has been removed from the campaign." });
      return true;
    } catch (err) {
      console.error("Error unlinking agent:", err);
      toast({ title: "Error", description: "Failed to remove agent", variant: "destructive" });
      return false;
    }
  };

  const linkContactList = async (campaignId: string, listId: string) => {
    // Demo implementation - update local state only
    setCampaigns((prev) =>
      prev.map((c) => {
        if (c.id !== campaignId) return c;
        const list = demoContactLists.find((l) => l.id === listId);
        if (!list) return c;
        return {
          ...c,
          contactLists: [...c.contactLists, list],
        };
      })
    );

    toast({ title: "List Linked", description: "Contact list has been added to the campaign." });
    return true;
  };

  const unlinkContactList = async (campaignId: string, listId: string) => {
    // Demo implementation - update local state only
    setCampaigns((prev) =>
      prev.map((c) => {
        if (c.id !== campaignId) return c;
        return {
          ...c,
          contactLists: c.contactLists.filter((l) => l.id !== listId),
        };
      })
    );

    toast({ title: "List Removed", description: "Contact list has been removed from the campaign." });
    return true;
  };

  return {
    campaigns,
    isLoading,
    error,
    createCampaign,
    updateCampaign,
    updateCampaignStatus,
    deleteCampaign,
    linkAgent,
    unlinkAgent,
    linkContactList,
    unlinkContactList,
    refetch: fetchCampaigns,
  };
}
