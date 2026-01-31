import { useState, useEffect } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Bot,
  ArrowLeft,
  Phone,
  PhoneIncoming,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { useAgents } from "@/hooks/useAgents";
import { toast } from "sonner";

const AgentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { agents, isLoading, updateAgent } = useAgents();
  const [prompt, setPrompt] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const agent = agents.find((a) => a.id === id);

  useEffect(() => {
    if (agent && agent.system_prompt) {
      setPrompt(agent.system_prompt);
    }
  }, [agent]);

  const handleSavePrompt = async () => {
    if (!agent || !id) return;

    try {
      setIsSaving(true);
      await updateAgent(id, { system_prompt: prompt });
      toast.success("Agent prompt updated successfully");
    } catch (error) {
      toast.error("Failed to update prompt");
    } finally {
      setIsSaving(false);
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
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Agents
          </Button>
        </div>
      </PageContainer>
    );
  }

  // Assuming outbound for MVP unless we add type to schema later
  const getTypeBadge = () => {
    if (agent.status === "active") {
      return (
        <Badge className="bg-success/15 text-success border-success/40 border">
          <CheckCircle2 className="h-3 w-3 mr-1" />
          Active
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="bg-muted text-muted-foreground border-border">
        Inactive
      </Badge>
    );
  };

  return (
    <PageContainer>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-2 mb-4">
          <Button variant="ghost" size="sm" onClick={() => navigate("/agents")}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Agents
          </Button>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-6">
          <div className="flex items-start gap-4">
            <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center">
              <Bot className="h-7 w-7 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl lg:text-3xl font-semibold text-foreground tracking-tight">
                  {agent.name}
                </h1>
                {getTypeBadge()}
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <span className="text-sm border-r border-border pr-2">{agent.language}</span>
                <span className="text-sm pl-0">{agent.tone}</span>
              </div>
            </div>
          </div>
          {/* Add more status actions here later */}
        </div>
      </motion.div>

      {/* Agent Prompt Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="agent-prompt" className="text-base font-medium text-foreground">
              Agent Prompt
            </Label>
            <Button
              onClick={handleSavePrompt}
              disabled={isSaving || prompt === agent.system_prompt}
              size="sm"
            >
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </div>
          <Textarea
            id="agent-prompt"
            value={prompt || ""}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Enter or update the prompt that this agent will use during calls"
            className="min-h-[200px] resize-y text-base leading-relaxed font-mono text-sm"
          />
        </div>
      </motion.div>
    </PageContainer>
  );
};

export default AgentDetail;
