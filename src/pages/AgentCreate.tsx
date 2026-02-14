import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { AgentTopBar } from "@/components/agents/AgentTopBar";
import { AgentConfigPanel, PromptConfig, assemblePreview, getConfigHealth } from "@/components/agents/AgentConfigPanel";
import { AgentTestPanel } from "@/components/agents/AgentTestPanel";
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
  const { profile } = useAuth();
  const [isSaving, setIsSaving] = useState(false);

  const [name, setName] = useState("");
  const [promptConfig, setPromptConfig] = useState<PromptConfig>(EMPTY_PROMPT_CONFIG);
  const [firstMessage, setFirstMessage] = useState("");
  const [firstSpeaker, setFirstSpeaker] = useState("agent");
  const [firstMessageDelayMs, setFirstMessageDelayMs] = useState(2000);

  const configHealth = useMemo(() => getConfigHealth(promptConfig, firstMessage), [promptConfig, firstMessage]);

  const handleCreate = async () => {
    if (!name.trim()) { toast.error("Please enter an agent name"); return; }
    if (!promptConfig.agent_instructions.trim()) { toast.error("Please enter agent instructions"); return; }
    if (!profile?.organization_id) { toast.error("You must be logged in to create an agent"); return; }

    try {
      setIsSaving(true);
      const assembledPrompt = assemblePreview(promptConfig);

      // Create agent record
      const { data: newAgent, error } = await supabase
        .from("agents")
        .insert({
          organization_id: profile.organization_id,
          name: name.trim(),
          language: "en-US",
          tone: "professional",
          system_prompt: assembledPrompt,
          type: "voice",
          status: "draft",
        })
        .select()
        .single();
      if (error) throw error;

      // Create voice config
      if (newAgent) {
        const { error: vcError } = await supabase
          .from("voice_agent_configs")
          .insert({
            agent_id: newAgent.id,
            prompt_config: promptConfig as any,
            first_message: firstMessage || null,
            first_speaker: firstSpeaker,
            first_message_delay_ms: firstMessageDelayMs,
          });
        if (vcError) throw vcError;

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
        isSaving={isSaving}
        onSave={handleCreate}
        configHealth={configHealth}
      />

      <div className="flex flex-col lg:flex-row">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex-1 p-6 lg:border-r border-border overflow-auto"
        >
          <div className="max-w-2xl">
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

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="w-full lg:w-[440px] p-6 border-l-2 border-primary/10"
        >
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
