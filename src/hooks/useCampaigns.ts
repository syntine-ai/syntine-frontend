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

      // Fetch campaign contact lists with list names
      const { data: campaignLists } = await supabase
        .from("campaign_contact_lists")
        .select("campaign_id, contact_list_id, contact_lists(id, name)")
        .in("campaign_id", campaignIds);

      // Fetch list member counts
      const { data: listMembers } = await supabase
        .from("contact_list_members")
        .select("contact_list_id");

      const listCounts: Record<string, number> = {};
      listMembers?.forEach((m) => {
        listCounts[m.contact_list_id] = (listCounts[m.contact_list_id] || 0) + 1;
      });

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

        const contactLists = (campaignLists || [])
          .filter((cl) => cl.campaign_id === campaign.id)
          .map((cl) => ({
            id: cl.contact_list_id,
            name: (cl.contact_lists as any)?.name || "Unknown",
            contactCount: listCounts[cl.contact_list_id] || 0,
          }));

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

      // Link contact lists
      if (data.contactListIds && data.contactListIds.length > 0) {
        const listLinks = data.contactListIds.map((listId, index) => ({
          campaign_id: newCampaign.id,
          contact_list_id: listId,
          priority: index,
        }));

        await supabase.from("campaign_contact_lists").insert(listLinks);
      }

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
    try {
      const { error } = await supabase.from("campaign_contact_lists").insert({
        campaign_id: campaignId,
        contact_list_id: listId,
      });

      if (error) {
        if (error.message.includes("duplicate")) {
          toast({ title: "List already linked", description: "This list is already assigned to the campaign." });
          return false;
        }
        throw error;
      }

      await fetchCampaigns();
      toast({ title: "List Linked", description: "Contact list has been added to the campaign." });
      return true;
    } catch (err) {
      console.error("Error linking list:", err);
      toast({ title: "Error", description: "Failed to link contact list", variant: "destructive" });
      return false;
    }
  };

  const unlinkContactList = async (campaignId: string, listId: string) => {
    try {
      const { error } = await supabase
        .from("campaign_contact_lists")
        .delete()
        .eq("campaign_id", campaignId)
        .eq("contact_list_id", listId);

      if (error) throw error;

      await fetchCampaigns();
      toast({ title: "List Removed", description: "Contact list has been removed from the campaign." });
      return true;
    } catch (err) {
      console.error("Error unlinking list:", err);
      toast({ title: "Error", description: "Failed to remove contact list", variant: "destructive" });
      return false;
    }
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
