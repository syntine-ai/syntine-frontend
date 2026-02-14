import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type PhoneNumber = Database["public"]["Tables"]["phone_numbers"]["Row"];
type PhoneNumberStatus = Database["public"]["Enums"]["phone_number_status"];

export interface PhoneNumberWithAgent extends PhoneNumber {
  agent?: {
    id: string;
    name: string;
  } | null;
}

interface UsePhoneNumbersFilters {
  country?: string;
  search?: string;
}

export function usePhoneNumbers() {
  const { profile } = useAuth();
  const [orgNumbers, setOrgNumbers] = useState<PhoneNumberWithAgent[]>([]);
  const [availableNumbers, setAvailableNumbers] = useState<PhoneNumberWithAgent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNumbers = useCallback(async () => {
    if (!profile?.organization_id) return;

    try {
      setIsLoading(true);
      setError(null);

      // Fetch org's assigned numbers with agent info
      const { data: orgData, error: orgError } = await supabase
        .from("phone_numbers")
        .select(`
          *,
          agents!phone_numbers_agent_id_fkey(id, name)
        `)
        .eq("organization_id", profile.organization_id)
        .order("created_at", { ascending: false });

      if (orgError) throw orgError;

      // Fetch available numbers
      const { data: availableData, error: availableError } = await supabase
        .from("phone_numbers")
        .select("*")
        .eq("status", "available")
        .is("organization_id", null)
        .order("country", { ascending: true });

      if (availableError) throw availableError;

      // Transform the data
      const transformedOrgNumbers: PhoneNumberWithAgent[] = (orgData || []).map((num) => ({
        ...num,
        agent: num.agents ? { id: num.agents.id, name: num.agents.name } : null,
      }));

      setOrgNumbers(transformedOrgNumbers);
      setAvailableNumbers(availableData || []);
    } catch (err) {
      console.error("Error fetching phone numbers:", err);
      setError("Failed to fetch phone numbers");
    } finally {
      setIsLoading(false);
    }
  }, [profile?.organization_id]);

  useEffect(() => {
    fetchNumbers();
  }, [fetchNumbers]);

  const assignNumber = async (numberId: string) => {
    if (!profile?.organization_id) {
      toast.error("You must be logged in to assign a number");
      return false;
    }

    try {
      const { error } = await supabase
        .from("phone_numbers")
        .update({
          organization_id: profile.organization_id,
          status: "assigned" as PhoneNumberStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", numberId)
        .eq("status", "available");

      if (error) throw error;

      toast.success("Phone number assigned to your organization");
      await fetchNumbers();
      return true;
    } catch (err) {
      console.error("Error assigning number:", err);
      toast.error("Failed to assign phone number");
      return false;
    }
  };

  const releaseNumber = async (numberId: string) => {
    try {
      // First check if connected to agent
      const number = orgNumbers.find((n) => n.id === numberId);
      if (number?.agent_id) {
        toast.error("Disconnect from agent first before releasing");
        return false;
      }

      const { error } = await supabase
        .from("phone_numbers")
        .update({
          organization_id: null,
          agent_id: null,
          status: "available" as PhoneNumberStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", numberId);

      if (error) throw error;

      toast.success("Phone number released back to pool");
      await fetchNumbers();
      return true;
    } catch (err) {
      console.error("Error releasing number:", err);
      toast.error("Failed to release phone number");
      return false;
    }
  };

  const connectToAgent = async (numberId: string, agentId: string) => {
    try {
      // Update phone_numbers table
      const { error: phoneError } = await supabase
        .from("phone_numbers")
        .update({
          agent_id: agentId,
          updated_at: new Date().toISOString(),
        })
        .eq("id", numberId);

      if (phoneError) throw phoneError;

      // Update voice_agent_configs table
      const { error: agentError } = await supabase
        .from("voice_agent_configs")
        .update({
          phone_number_id: numberId,
          updated_at: new Date().toISOString(),
        })
        .eq("agent_id", agentId);

      if (agentError) throw agentError;

      toast.success("Phone number connected to agent");
      await fetchNumbers();
      return true;
    } catch (err) {
      console.error("Error connecting to agent:", err);
      toast.error("Failed to connect phone number to agent");
      return false;
    }
  };

  const disconnectFromAgent = async (numberId: string) => {
    try {
      const number = orgNumbers.find((n) => n.id === numberId);
      const agentId = number?.agent_id;

      // Update phone_numbers table
      const { error: phoneError } = await supabase
        .from("phone_numbers")
        .update({
          agent_id: null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", numberId);

      if (phoneError) throw phoneError;

      // Update voice_agent_configs table if there was an agent
      if (agentId) {
        const { error: agentError } = await supabase
          .from("voice_agent_configs")
          .update({
            phone_number_id: null,
            updated_at: new Date().toISOString(),
          })
          .eq("agent_id", agentId);

        if (agentError) throw agentError;
      }

      toast.success("Phone number disconnected from agent");
      await fetchNumbers();
      return true;
    } catch (err) {
      console.error("Error disconnecting from agent:", err);
      toast.error("Failed to disconnect phone number");
      return false;
    }
  };

  // Computed stats
  const stats = {
    totalAssigned: orgNumbers.length,
    connectedToAgents: orgNumbers.filter((n) => n.agent_id).length,
    availablePool: availableNumbers.length,
    monthlyCost: orgNumbers.reduce((sum, n) => sum + (Number(n.monthly_cost) || 0), 0),
  };

  return {
    orgNumbers,
    availableNumbers,
    isLoading,
    error,
    stats,
    assignNumber,
    releaseNumber,
    connectToAgent,
    disconnectFromAgent,
    refetch: fetchNumbers,
  };
}
