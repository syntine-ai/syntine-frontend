import { useState } from "react";
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
} from "lucide-react";
import { getAgentById, type MockAgent } from "@/data/demoAgentCampaignData";

const AgentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState("");

  const agent = id ? getAgentById(id) : undefined;

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

  const getTypeBadge = (type: MockAgent["type"]) => {
    if (type === "Outbound") {
      return (
        <Badge className="bg-primary/15 text-primary border-primary/40 border">
          <Phone className="h-3 w-3 mr-1" />
          Outbound
        </Badge>
      );
    }
    return (
      <Badge className="bg-success/15 text-success border-success/40 border">
        <PhoneIncoming className="h-3 w-3 mr-1" />
        Inbound
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
                {getTypeBadge(agent.type)}
              </div>
              <p className="text-muted-foreground">{agent.purpose}</p>
            </div>
          </div>
          <Badge className="bg-success/15 text-success border-success/40 border">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            {agent.status}
          </Badge>
        </div>


      </motion.div>

      {/* Agent Prompt Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="space-y-3">
          <Label htmlFor="agent-prompt" className="text-base font-medium text-foreground">
            Agent Prompt
          </Label>
          <Textarea
            id="agent-prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Enter or update the prompt that this agent will use during calls"
            className="min-h-[200px] resize-y text-base leading-relaxed"
          />
        </div>
      </motion.div>
    </PageContainer>
  );
};

export default AgentDetail;
