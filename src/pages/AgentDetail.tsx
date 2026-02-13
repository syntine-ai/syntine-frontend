import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/button";
import { AgentTopBar } from "@/components/agents/AgentTopBar";
import { AgentConfigPanel, PromptConfig, assemblePreview } from "@/components/agents/AgentConfigPanel";
import { AgentTestPanel } from "@/components/agents/AgentTestPanel";
import { useAgents } from "@/hooks/useAgents";
import { toast } from "sonner";

const EMPTY_PROMPT_CONFIG: PromptConfig = {
  agent_instructions: "",
  off_topic_response: "",
  no_context_response: "",
  guardrails: [],
};

const AgentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { agents, isLoading, updateAgent, duplicateAgent, deleteAgent, updateAgentStatus } = useAgents();
  const [isSaving, setIsSaving] = useState(false);
  const [isViewMode, setIsViewMode] = useState(true);

  const agent = agents.find((a) => a.id === id);

  // Determine if this is a legacy agent (no prompt_config stored)
  const isLegacyMode = useMemo(() => {
    if (!agent) return false;
    return !agent.prompt_config;
  }, [agent]);

  // Form state
  const [name, setName] = useState("");
  const [promptConfig, setPromptConfig] = useState<PromptConfig>(EMPTY_PROMPT_CONFIG);
  const [legacySystemPrompt, setLegacySystemPrompt] = useState("");
  const [firstMessage, setFirstMessage] = useState("");
  const [firstSpeaker, setFirstSpeaker] = useState("agent");
  const [firstMessageDelayMs, setFirstMessageDelayMs] = useState(2000);

  useEffect(() => {
    if (agent) {
      setName(agent.name);
      setFirstMessage(agent.first_message || "");
      setFirstSpeaker(agent.first_speaker || "agent");
      setFirstMessageDelayMs(agent.first_message_delay_ms || 2000);

      if (agent.prompt_config && typeof agent.prompt_config === "object") {
        const pc = agent.prompt_config as Record<string, unknown>;
        setPromptConfig({
          agent_instructions: (pc.agent_instructions as string) || "",
          off_topic_response: (pc.off_topic_response as string) || "",
          no_context_response: (pc.no_context_response as string) || "",
          guardrails: Array.isArray(pc.guardrails) ? (pc.guardrails as string[]) : [],
        });
      } else {
        // Legacy: use raw system_prompt
        setLegacySystemPrompt(agent.system_prompt || "");
      }
    }
  }, [agent]);

  // Check for unsaved changes
  const hasUnsavedChanges = useMemo(() => {
    if (!agent) return false;

    const nameChanged = name !== agent.name;
    const firstMessageChanged = firstMessage !== (agent.first_message || "");
    const speakerChanged = firstSpeaker !== (agent.first_speaker || "agent");
    const delayChanged = firstMessageDelayMs !== (agent.first_message_delay_ms || 2000);

    if (isLegacyMode) {
      return nameChanged || legacySystemPrompt !== (agent.system_prompt || "") ||
        firstMessageChanged || speakerChanged || delayChanged;
    }

    // For structured mode, compare prompt_config fields
    const pc = agent.prompt_config as Record<string, unknown> | null;
    const configChanged = !pc ||
      promptConfig.agent_instructions !== ((pc.agent_instructions as string) || "") ||
      promptConfig.off_topic_response !== ((pc.off_topic_response as string) || "") ||
      promptConfig.no_context_response !== ((pc.no_context_response as string) || "") ||
      JSON.stringify(promptConfig.guardrails) !== JSON.stringify(pc.guardrails || []);

    return nameChanged || configChanged || firstMessageChanged || speakerChanged || delayChanged;
  }, [agent, name, promptConfig, legacySystemPrompt, firstMessage, firstSpeaker, firstMessageDelayMs, isLegacyMode]);

  const handleSave = async () => {
    if (!agent || !id) return;

    try {
      setIsSaving(true);

      const updateData: any = {
        name: name.trim(),
        first_message: firstMessage,
        first_speaker: firstSpeaker,
        first_message_delay_ms: firstMessageDelayMs,
      };

      if (isLegacyMode) {
        updateData.system_prompt = legacySystemPrompt;
      } else {
        updateData.prompt_config = promptConfig;
        updateData.system_prompt = assemblePreview(promptConfig);
      }

      await updateAgent(id, updateData);

      toast.success("Agent saved successfully");
      setIsViewMode(true);
    } catch (error) {
      toast.error("Failed to save agent");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!id) return;
    await updateAgentStatus(id, "active");
    toast.success("Agent published successfully");
  };

  const handleUnpublish = async () => {
    if (!id) return;
    await updateAgentStatus(id, "inactive");
    toast.success("Agent unpublished");
  };

  const handleDuplicate = async () => {
    if (!agent) return;
    const newAgent = await duplicateAgent(agent);
    if (newAgent) {
      navigate(`/agents/${newAgent.id}`);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    const success = await deleteAgent(id);
    if (success) {
      navigate("/agents");
    }
  };

  if (isLoading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </PageContainer>
    );
  }

  if (!agent) {
    return (
      <PageContainer>
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-foreground mb-2">Agent not found</h2>
          <p className="text-muted-foreground mb-4">The agent you're looking for doesn't exist.</p>
          <Button onClick={() => navigate("/agents")}>
            Back to Agents
          </Button>
        </div>
      </PageContainer>
    );
  }

  const mode = isViewMode ? "view" : "edit";

  return (
    <div className="min-h-screen bg-background">
      <AgentTopBar
        mode={mode}
        name={name}
        onNameChange={setName}
        status={agent.status || "draft"}
        isSaving={isSaving}
        hasUnsavedChanges={hasUnsavedChanges}
        onSave={handleSave}
        onPublish={handlePublish}
        onUnpublish={handleUnpublish}
        onDuplicate={handleDuplicate}
        onDelete={handleDelete}
        onEdit={() => setIsViewMode(false)}
      />

      {/* Two-Panel Layout */}
      <div className="flex flex-col lg:flex-row max-w-7xl mx-auto border-x border-border min-h-[calc(100vh-65px)]">
        {/* Left Panel - Configuration */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex-1 p-6 lg:border-r border-border overflow-auto"
        >
          <div className="max-w-2xl">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Agent Configuration
            </h2>
            <AgentConfigPanel
              promptConfig={promptConfig}
              onPromptConfigChange={setPromptConfig}
              legacySystemPrompt={legacySystemPrompt}
              onLegacySystemPromptChange={setLegacySystemPrompt}
              isLegacyMode={isLegacyMode}
              firstMessage={firstMessage}
              onFirstMessageChange={setFirstMessage}
              firstSpeaker={firstSpeaker}
              onFirstSpeakerChange={setFirstSpeaker}
              firstMessageDelayMs={firstMessageDelayMs}
              onFirstMessageDelayMsChange={setFirstMessageDelayMs}
              isReadOnly={isViewMode}
              agentId={agent.id}
              linkedCampaigns={agent.linkedCampaigns}
              createdAt={agent.created_at || undefined}
              updatedAt={agent.updated_at || undefined}
            />
          </div>
        </motion.div>

        {/* Right Panel - Testing */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="w-full lg:w-[400px] p-6 bg-muted/20"
        >
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Agent Testing
          </h2>
          <AgentTestPanel
            agentId={agent.id}
            agentName={agent.name}
            hasPhoneNumber={!!agent.phone_number_id}
            systemPrompt={isLegacyMode ? legacySystemPrompt : agent.system_prompt || ""}
            firstMessage={firstMessage}
          />
        </motion.div>
      </div>
    </div>
  );
};

export default AgentDetail;
