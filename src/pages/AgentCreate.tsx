import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { AgentTopBar } from "@/components/agents/AgentTopBar";
import { AgentConfigPanel, PromptConfig, assemblePreview } from "@/components/agents/AgentConfigPanel";
import { AgentTestPanel } from "@/components/agents/AgentTestPanel";
import { useAgents } from "@/hooks/useAgents";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const EMPTY_PROMPT_CONFIG: PromptConfig = {
  agent_instructions: "",
  off_topic_response: "",
  no_context_response: "",
  guardrails: [],
};

const AgentCreate = () => {
  const navigate = useNavigate();
  const { createAgent } = useAgents();
  const { profile } = useAuth();
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [promptConfig, setPromptConfig] = useState<PromptConfig>(EMPTY_PROMPT_CONFIG);
  const [firstMessage, setFirstMessage] = useState("");
  const [firstSpeaker, setFirstSpeaker] = useState("agent");
  const [firstMessageDelayMs, setFirstMessageDelayMs] = useState(2000);

  const handleCreate = async () => {
    if (!name.trim()) {
      toast.error("Please enter an agent name");
      return;
    }

    if (!promptConfig.agent_instructions.trim()) {
      toast.error("Please enter agent instructions");
      return;
    }

    if (!profile?.organization_id) {
      toast.error("You must be logged in to create an agent");
      return;
    }

    try {
      setIsSaving(true);

      // Assemble system_prompt from structured config (mirrors backend logic)
      const assembledPrompt = assemblePreview(promptConfig);

      // Insert with prompt_config + assembled system_prompt
      const { data: newAgent, error } = await supabase
        .from("agents")
        .insert({
          organization_id: profile.organization_id,
          name: name.trim(),
          language: "en-US",
          tone: "professional",
          prompt_config: promptConfig as any,
          system_prompt: assembledPrompt,
          first_message: firstMessage || null,
          first_speaker: firstSpeaker,
          first_message_delay_ms: firstMessageDelayMs,
          status: "draft",
        })
        .select()
        .single();

      if (error) throw error;

      if (newAgent) {
        toast.success("Agent created successfully");
        navigate(`/agents/${newAgent.id}`);
      }
    } catch (error) {
      console.error("Failed to create agent:", error);
      toast.error("Failed to create agent");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <AgentTopBar
        mode="create"
        name={name}
        onNameChange={setName}
        status="draft"
        isSaving={isSaving}
        onSave={handleCreate}
      />

      {/* Two-Panel Layout */}
      <div className="flex flex-col lg:flex-row">
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
              firstMessage={firstMessage}
              onFirstMessageChange={setFirstMessage}
              firstSpeaker={firstSpeaker}
              onFirstSpeakerChange={setFirstSpeaker}
              firstMessageDelayMs={firstMessageDelayMs}
              onFirstMessageDelayMsChange={setFirstMessageDelayMs}
              isReadOnly={false}
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
            agentName={name || "New Agent"}
            hasPhoneNumber={false}
            isDisabled={true}
          />
        </motion.div>
      </div>
    </div>
  );
};

export default AgentCreate;