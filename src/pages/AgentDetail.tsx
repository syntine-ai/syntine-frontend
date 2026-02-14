import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/button";
import { AgentTopBar } from "@/components/agents/AgentTopBar";
import { AgentConfigPanel, PromptConfig, assemblePreview, getConfigHealth } from "@/components/agents/AgentConfigPanel";
import { AgentTestPanel } from "@/components/agents/AgentTestPanel";
import { useAgents } from "@/hooks/useAgents";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

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
  const voiceConfig = agent?.voiceConfig;

  const isLegacyMode = useMemo(() => {
    if (!agent) return false;
    return !voiceConfig?.prompt_config;
  }, [agent, voiceConfig]);

  const [name, setName] = useState("");
  const [promptConfig, setPromptConfig] = useState<PromptConfig>(EMPTY_PROMPT_CONFIG);
  const [legacySystemPrompt, setLegacySystemPrompt] = useState("");
  const [firstMessage, setFirstMessage] = useState("");
  const [firstSpeaker, setFirstSpeaker] = useState("agent");
  const [firstMessageDelayMs, setFirstMessageDelayMs] = useState(2000);

  useEffect(() => {
    if (agent) {
      setName(agent.name);
      setFirstMessage(voiceConfig?.first_message || "");
      setFirstSpeaker(voiceConfig?.first_speaker || "agent");
      setFirstMessageDelayMs(voiceConfig?.first_message_delay_ms || 2000);
      if (voiceConfig?.prompt_config && typeof voiceConfig.prompt_config === "object") {
        const pc = voiceConfig.prompt_config as Record<string, unknown>;
        setPromptConfig({
          agent_instructions: (pc.agent_instructions as string) || "",
          off_topic_response: (pc.off_topic_response as string) || "",
          no_context_response: (pc.no_context_response as string) || "",
          guardrails: Array.isArray(pc.guardrails) ? (pc.guardrails as string[]) : [],
        });
      } else {
        setLegacySystemPrompt(agent.system_prompt || "");
      }
    }
  }, [agent, voiceConfig]);

  const hasUnsavedChanges = useMemo(() => {
    if (!agent) return false;
    const nameChanged = name !== agent.name;
    const firstMessageChanged = firstMessage !== (voiceConfig?.first_message || "");
    const speakerChanged = firstSpeaker !== (voiceConfig?.first_speaker || "agent");
    const delayChanged = firstMessageDelayMs !== (voiceConfig?.first_message_delay_ms || 2000);
    if (isLegacyMode) {
      return nameChanged || legacySystemPrompt !== (agent.system_prompt || "") || firstMessageChanged || speakerChanged || delayChanged;
    }
    const pc = voiceConfig?.prompt_config as Record<string, unknown> | null | undefined;
    const configChanged = !pc ||
      promptConfig.agent_instructions !== ((pc.agent_instructions as string) || "") ||
      promptConfig.off_topic_response !== ((pc.off_topic_response as string) || "") ||
      promptConfig.no_context_response !== ((pc.no_context_response as string) || "") ||
      JSON.stringify(promptConfig.guardrails) !== JSON.stringify(pc.guardrails || []);
    return nameChanged || configChanged || firstMessageChanged || speakerChanged || delayChanged;
  }, [agent, voiceConfig, name, promptConfig, legacySystemPrompt, firstMessage, firstSpeaker, firstMessageDelayMs, isLegacyMode]);

  const configHealth = useMemo(() => getConfigHealth(promptConfig, firstMessage), [promptConfig, firstMessage]);

  const handleSave = async () => {
    if (!agent || !id) return;
    try {
      setIsSaving(true);

      // Update agent name & system_prompt
      const agentUpdateData: any = { name: name.trim() };
      if (isLegacyMode) {
        agentUpdateData.system_prompt = legacySystemPrompt;
      } else {
        agentUpdateData.system_prompt = assemblePreview(promptConfig);
      }
      await updateAgent(id, agentUpdateData);

      // Update voice config
      const voiceUpdateData: any = {
        first_message: firstMessage,
        first_speaker: firstSpeaker,
        first_message_delay_ms: firstMessageDelayMs,
      };
      if (!isLegacyMode) {
        voiceUpdateData.prompt_config = promptConfig;
      }

      if (voiceConfig) {
        await supabase
          .from("voice_agent_configs")
          .update(voiceUpdateData)
          .eq("agent_id", id);
      } else {
        await supabase
          .from("voice_agent_configs")
          .insert({ agent_id: id, ...voiceUpdateData });
      }

      toast.success("Agent saved successfully");
      setIsViewMode(true);
    } catch (error) {
      toast.error("Failed to save agent");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => { if (!id) return; await updateAgentStatus(id, "active"); toast.success("Agent published"); };
  const handleUnpublish = async () => { if (!id) return; await updateAgentStatus(id, "inactive"); toast.success("Agent unpublished"); };
  const handleDuplicate = async () => { if (!agent) return; const n = await duplicateAgent(agent); if (n) navigate(`/agents/${n.id}`); };
  const handleDelete = async () => { if (!id) return; const ok = await deleteAgent(id); if (ok) navigate("/agents"); };

  if (isLoading) {
    return <PageContainer><div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div></PageContainer>;
  }

  if (!agent) {
    return (
      <PageContainer>
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-foreground mb-2">Agent not found</h2>
          <p className="text-muted-foreground mb-4">The agent you're looking for doesn't exist.</p>
          <Button onClick={() => navigate("/agents")}>Back to Agents</Button>
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
        isSaving={isSaving}
        hasUnsavedChanges={hasUnsavedChanges}
        onSave={handleSave}
        onPublish={handlePublish}
        onUnpublish={handleUnpublish}
        onDuplicate={handleDuplicate}
        onDelete={handleDelete}
        onEdit={() => setIsViewMode(false)}
        configHealth={configHealth}
        agentId={agent.id}
        agentStatus={agent.status || "draft"}
        linkedCampaigns={agent.linkedCampaigns}
        createdAt={agent.created_at || undefined}
        updatedAt={agent.updated_at || undefined}
      />

      <div className="flex flex-col lg:flex-row max-w-7xl mx-auto border-x border-border min-h-[calc(100vh-57px)]">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex-1 p-6 lg:border-r border-border overflow-auto"
        >
          <div className="max-w-2xl">
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
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="w-full lg:w-[440px] p-6 border-l-2 border-primary/10"
        >
          <AgentTestPanel
            agentId={agent.id}
            agentName={agent.name}
            hasPhoneNumber={!!voiceConfig?.phone_number_id}
            systemPrompt={isLegacyMode ? legacySystemPrompt : agent.system_prompt || ""}
            firstMessage={firstMessage}
            hasUnsavedChanges={hasUnsavedChanges && !isViewMode}
            agentStatus={agent.status || "draft"}
          />
        </motion.div>
      </div>
    </div>
  );
};

export default AgentDetail;
