import { OrgAppShell } from "@/components/layout/OrgAppShell";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { StatusPill } from "@/components/shared/StatusPill";
import { PromptEditorCard } from "@/components/agents/PromptEditorCard";
import { SentimentRulesCard } from "@/components/agents/SentimentRulesCard";
import { TestCallCard } from "@/components/agents/TestCallCard";
import { SkeletonCard } from "@/components/shared/SkeletonCard";
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Bot, Copy, Globe, Layers, Save, ArrowLeft, Loader2 } from "lucide-react";
import { useAgents } from "@/hooks/useAgents";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

const defaultPrompt = `You are a helpful AI assistant for customer service calls.

Guidelines:
- Be polite and professional at all times
- Listen carefully to customer concerns
- Provide clear and concise answers
- Offer solutions when possible
- Escalate to a human agent if needed

Remember to:
- Introduce yourself at the start of each call
- Confirm customer details before proceeding
- Summarize key points at the end of the call`;

interface LinkedCampaign {
  id: string;
  name: string;
  status: "running" | "paused" | "draft" | "completed";
  callsToday: number;
}

const AgentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { updateAgent, duplicateAgent } = useAgents();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [agent, setAgent] = useState<Database["public"]["Tables"]["agents"]["Row"] | null>(null);
  const [linkedCampaigns, setLinkedCampaigns] = useState<LinkedCampaign[]>([]);

  // Editable state
  const [isActive, setIsActive] = useState(true);
  const [prompt, setPrompt] = useState(defaultPrompt);
  const [hasChanges, setHasChanges] = useState(false);

  // Fetch agent data
  const fetchAgent = useCallback(async () => {
    if (!id) return;

    try {
      setIsLoading(true);

      // Fetch agent
      const { data: agentData, error: agentError } = await supabase
        .from("agents")
        .select("*")
        .eq("id", id)
        .single();

      if (agentError) throw agentError;

      setAgent(agentData);
      setIsActive(agentData.status === "active");
      setPrompt(agentData.system_prompt || defaultPrompt);

      // Fetch linked campaigns
      const { data: campaignAgents, error: campaignError } = await supabase
        .from("campaign_agents")
        .select(`
          campaign_id,
          campaigns:campaign_id(id, name, status)
        `)
        .eq("agent_id", id);

      if (campaignError) throw campaignError;

      // Get today's call counts for each campaign
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const campaignsWithCalls: LinkedCampaign[] = await Promise.all(
        (campaignAgents || []).map(async (ca: any) => {
          if (!ca.campaigns) return null;

          const { count } = await supabase
            .from("calls")
            .select("*", { count: "exact", head: true })
            .eq("campaign_id", ca.campaigns.id)
            .gte("created_at", today.toISOString());

          return {
            id: ca.campaigns.id,
            name: ca.campaigns.name,
            status: ca.campaigns.status as LinkedCampaign["status"],
            callsToday: count || 0,
          };
        })
      );

      setLinkedCampaigns(campaignsWithCalls.filter(Boolean) as LinkedCampaign[]);
    } catch (err: any) {
      console.error("Error fetching agent:", err);
      toast.error("Failed to load agent");
      navigate("/app/agents");
    } finally {
      setIsLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchAgent();
  }, [fetchAgent]);

  // Track changes
  useEffect(() => {
    if (!agent) return;

    const currentStatus = isActive ? "active" : "inactive";
    const hasPromptChange = prompt !== (agent.system_prompt || defaultPrompt);
    const hasStatusChange = currentStatus !== agent.status;

    setHasChanges(hasPromptChange || hasStatusChange);
  }, [agent, isActive, prompt]);

  const handleSave = async () => {
    if (!id || !agent) return;

    try {
      setIsSaving(true);

      await updateAgent(id, {
        status: isActive ? "active" : "inactive",
        system_prompt: prompt,
      });

      setAgent((prev) =>
        prev
          ? {
            ...prev,
            status: isActive ? "active" : "inactive",
            system_prompt: prompt,
          }
          : prev
      );

      setHasChanges(false);
      toast.success("Agent saved successfully");
    } catch (err) {
      console.error("Error saving agent:", err);
      toast.error("Failed to save agent");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDuplicate = async () => {
    if (!agent) return;

    try {
      // Create an AgentWithCampaigns object for the duplicateAgent function
      const agentWithCampaigns = {
        ...agent,
        linkedCampaigns: linkedCampaigns.length,
      };
      const newAgent = await duplicateAgent(agentWithCampaigns);
      if (newAgent) {
        navigate(`/app/agents/${newAgent.id}`);
      }
    } catch (err) {
      console.error("Error duplicating agent:", err);
    }
  };

  if (isLoading) {
    return (
      <OrgAppShell>
        <PageContainer>
          <div className="space-y-6">
            <SkeletonCard className="h-24" />
            <SkeletonCard className="h-96" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <SkeletonCard className="h-64" />
              <SkeletonCard className="h-64" />
            </div>
          </div>
        </PageContainer>
      </OrgAppShell>
    );
  }

  if (!agent) {
    return null;
  }

  return (
    <OrgAppShell>
      <PageContainer>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-2 mb-4">
            <Button variant="ghost" size="sm" onClick={() => navigate("/app/agents")}>
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Agents
            </Button>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
            <div className="flex items-start gap-4">
              <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center">
                <Bot className="h-7 w-7 text-primary" />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-2xl lg:text-3xl font-semibold text-foreground tracking-tight">
                    {agent.name}
                  </h1>
                  <StatusPill status={isActive ? "active" : "inactive"} />
                </div>
                <p className="text-muted-foreground text-sm">Agent ID: {id}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 mr-4">
                <span className="text-sm text-muted-foreground">Active</span>
                <Switch checked={isActive} onCheckedChange={setIsActive} />
              </div>
              <Button variant="outline" className="gap-2" onClick={handleDuplicate}>
                <Copy className="h-4 w-4" /> Duplicate
              </Button>
              <Button
                className="gap-2"
                onClick={handleSave}
                disabled={!hasChanges || isSaving}
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Save Changes
              </Button>
            </div>
          </div>

          {/* Subinfo */}
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-foreground">{agent.language || "English"}</span>
            </div>
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-foreground">
                {linkedCampaigns.length} Linked Campaign{linkedCampaigns.length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="space-y-6">
          {/* Prompt Editor */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <PromptEditorCard value={prompt} onChange={setPrompt} />
          </motion.div>

          {/* Sentiment Rules & Test Call */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
            >
              <SentimentRulesCard />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <TestCallCard />
            </motion.div>
          </div>

          {/* Linked Campaigns */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
          >
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-lg">Linked Campaigns</CardTitle>
                <CardDescription>
                  Campaigns using this agent
                </CardDescription>
              </CardHeader>
              <CardContent>
                {linkedCampaigns.length === 0 ? (
                  <p className="text-muted-foreground text-sm py-4 text-center">
                    No campaigns are currently using this agent
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left p-3 text-sm font-medium text-muted-foreground">Campaign Name</th>
                          <th className="text-left p-3 text-sm font-medium text-muted-foreground">Status</th>
                          <th className="text-left p-3 text-sm font-medium text-muted-foreground">Calls Today</th>
                        </tr>
                      </thead>
                      <tbody>
                        {linkedCampaigns.map((campaign, i) => (
                          <motion.tr
                            key={campaign.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: i * 0.05 }}
                            className="border-b border-border/50 last:border-0 hover:bg-secondary/20 cursor-pointer"
                            onClick={() => navigate(`/app/campaigns/${campaign.id}`)}
                          >
                            <td className="p-3 font-medium text-foreground">{campaign.name}</td>
                            <td className="p-3">
                              <StatusPill status={campaign.status} />
                            </td>
                            <td className="p-3 text-foreground">{campaign.callsToday}</td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </PageContainer>
    </OrgAppShell>
  );
};

export default AgentDetail;
