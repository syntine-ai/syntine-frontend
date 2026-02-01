import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import type { Database } from "@/integrations/supabase/types";

type Agent = Database["public"]["Tables"]["agents"]["Row"];
type AgentInsert = Database["public"]["Tables"]["agents"]["Insert"];
type AgentUpdate = Database["public"]["Tables"]["agents"]["Update"];
type AgentTone = Database["public"]["Enums"]["agent_tone"];
type AgentStatus = Database["public"]["Enums"]["agent_status"];

export interface AgentWithCampaigns extends Agent {
  linkedCampaigns: number;
  phone_number?: {
    id: string;
    phone_number: string;
    country: string;
  } | null;
}

export function useAgents() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [agents, setAgents] = useState<AgentWithCampaigns[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAgents = useCallback(async () => {
    if (!profile?.organization_id) return;

    try {
      setIsLoading(true);
      setError(null);

      // Fetch agents with phone number info
      const { data: agentsData, error: agentsError } = await supabase
        .from("agents")
        .select(`
          *,
          phone_numbers!agents_phone_number_id_fkey(id, phone_number, country)
        `)
        .eq("organization_id", profile.organization_id)
        .is("deleted_at", null)
        .order("updated_at", { ascending: false });

      if (agentsError) throw agentsError;

      // Fetch campaign counts for each agent
      const { data: campaignAgents, error: campaignError } = await supabase
        .from("campaign_agents")
        .select("agent_id, campaign_id");

      if (campaignError) throw campaignError;

      // Count campaigns per agent
      const campaignCounts: Record<string, number> = {};
      campaignAgents?.forEach((ca) => {
        campaignCounts[ca.agent_id] = (campaignCounts[ca.agent_id] || 0) + 1;
      });

      // Combine data
      const agentsWithCampaigns: AgentWithCampaigns[] = (agentsData || []).map((agent) => ({
        ...agent,
        linkedCampaigns: campaignCounts[agent.id] || 0,
        phone_number: agent.phone_numbers ? {
          id: agent.phone_numbers.id,
          phone_number: agent.phone_numbers.phone_number,
          country: agent.phone_numbers.country,
        } : null,
      }));

      setAgents(agentsWithCampaigns);
    } catch (err) {
      console.error("Error fetching agents:", err);
      setError("Failed to fetch agents");
      toast({
        title: "Error",
        description: "Failed to fetch agents",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [profile?.organization_id, toast]);

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  const createAgent = async (data: {
    name: string;
    language: string;
    tone: AgentTone;
    system_prompt?: string;
  }) => {
    if (!profile?.organization_id) {
      toast({
        title: "Error",
        description: "You must be logged in to create an agent",
        variant: "destructive",
      });
      return null;
    }

    try {
      const agentData: AgentInsert = {
        organization_id: profile.organization_id,
        name: data.name,
        language: data.language,
        tone: data.tone,
        system_prompt: data.system_prompt || null,
        status: "draft",
      };

      const { data: newAgent, error } = await supabase
        .from("agents")
        .insert(agentData)
        .select()
        .single();

      if (error) throw error;

      // Add to local state
      setAgents((prev) => [{ ...newAgent, linkedCampaigns: 0 }, ...prev]);

      toast({
        title: "Agent Created",
        description: `"${data.name}" has been created successfully.`,
      });

      return newAgent;
    } catch (err) {
      console.error("Error creating agent:", err);
      toast({
        title: "Error",
        description: "Failed to create agent",
        variant: "destructive",
      });
      return null;
    }
  };

  const updateAgent = async (id: string, data: Partial<AgentUpdate>) => {
    try {
      const { data: updatedAgent, error } = await supabase
        .from("agents")
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      // Update local state
      setAgents((prev) =>
        prev.map((agent) =>
          agent.id === id ? { ...agent, ...updatedAgent } : agent
        )
      );

      toast({
        title: "Agent Updated",
        description: "Agent has been updated successfully.",
      });

      return updatedAgent;
    } catch (err) {
      console.error("Error updating agent:", err);
      toast({
        title: "Error",
        description: "Failed to update agent",
        variant: "destructive",
      });
      return null;
    }
  };

  const duplicateAgent = async (agent: AgentWithCampaigns) => {
    if (!profile?.organization_id) return null;

    try {
      const agentData: AgentInsert = {
        organization_id: profile.organization_id,
        name: `${agent.name} (Copy)`,
        language: agent.language,
        tone: agent.tone,
        system_prompt: agent.system_prompt,
        sentiment_rules: agent.sentiment_rules,
        voice_settings: agent.voice_settings,
        status: "draft",
      };

      const { data: newAgent, error } = await supabase
        .from("agents")
        .insert(agentData)
        .select()
        .single();

      if (error) throw error;

      setAgents((prev) => [{ ...newAgent, linkedCampaigns: 0 }, ...prev]);

      toast({
        title: "Agent Duplicated",
        description: `"${newAgent.name}" has been created.`,
      });

      return newAgent;
    } catch (err) {
      console.error("Error duplicating agent:", err);
      toast({
        title: "Error",
        description: "Failed to duplicate agent",
        variant: "destructive",
      });
      return null;
    }
  };

  const deleteAgent = async (id: string) => {
    try {
      // Soft delete
      const { error } = await supabase
        .from("agents")
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", id);

      if (error) throw error;

      setAgents((prev) => prev.filter((agent) => agent.id !== id));

      toast({
        title: "Agent Deleted",
        description: "The agent has been removed.",
        variant: "destructive",
      });

      return true;
    } catch (err) {
      console.error("Error deleting agent:", err);
      toast({
        title: "Error",
        description: "Failed to delete agent",
        variant: "destructive",
      });
      return false;
    }
  };

  const updateAgentStatus = async (id: string, status: AgentStatus) => {
    return updateAgent(id, { status });
  };

  return {
    agents,
    isLoading,
    error,
    createAgent,
    updateAgent,
    duplicateAgent,
    deleteAgent,
    updateAgentStatus,
    refetch: fetchAgents,
  };
}
