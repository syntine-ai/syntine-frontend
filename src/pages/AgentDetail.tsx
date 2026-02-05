import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/button";
import { AgentTopBar } from "@/components/agents/AgentTopBar";
import { AgentConfigPanel } from "@/components/agents/AgentConfigPanel";
import { AgentTestPanel } from "@/components/agents/AgentTestPanel";
import { useAgents } from "@/hooks/useAgents";
import { toast } from "sonner";

// Helper to parse first message from system prompt
const parsePromptParts = (prompt: string | null) => {
  if (!prompt) return { systemPrompt: "", firstMessage: "" };

  const separator = "\n\n---\nFIRST MESSAGE:\n";
  const parts = prompt.split(separator);

  return {
    systemPrompt: parts[0] || "",
    firstMessage: parts[1] || "",
  };
};

const AgentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { agents, isLoading, updateAgent, duplicateAgent, deleteAgent, updateAgentStatus } = useAgents();
  const [isSaving, setIsSaving] = useState(false);
  const [isViewMode, setIsViewMode] = useState(true);

  const agent = agents.find((a) => a.id === id);

  // Parse the stored prompt into system prompt and first message
  const initialParts = useMemo(() => parsePromptParts(agent?.system_prompt || null), [agent?.system_prompt]);

  // Form state
  const [name, setName] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [firstMessage, setFirstMessage] = useState("");

  useEffect(() => {
    if (agent) {
      setName(agent.name);
      setSystemPrompt(initialParts.systemPrompt);
      setFirstMessage(initialParts.firstMessage);
    }
  }, [agent, initialParts]);

  // Check for unsaved changes
  const hasUnsavedChanges = useMemo(() => {
    if (!agent) return false;

    const currentCombined = firstMessage
      ? `${systemPrompt}\n\n---\nFIRST MESSAGE:\n${firstMessage}`
      : systemPrompt;

    return (
      name !== agent.name ||
      currentCombined !== (agent.system_prompt || "")
    );
  }, [agent, name, systemPrompt, firstMessage]);

  const handleSave = async () => {
    if (!agent || !id) return;

    try {
      setIsSaving(true);

      const combinedPrompt = firstMessage
        ? `${systemPrompt}\n\n---\nFIRST MESSAGE:\n${firstMessage}`
        : systemPrompt;

      await updateAgent(id, {
        name: name.trim(),
        system_prompt: combinedPrompt,
      });

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
              systemPrompt={systemPrompt}
              onSystemPromptChange={setSystemPrompt}
              firstMessage={firstMessage}
              onFirstMessageChange={setFirstMessage}
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
          />
        </motion.div>
      </div>
    </div>
  );
};

export default AgentDetail;
