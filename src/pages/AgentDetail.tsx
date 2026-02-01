import { useState, useEffect } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Bot,
  ArrowLeft,
  Phone,
  CheckCircle2,
  Loader2,
  PhoneCall,
  ExternalLink,
  PhoneOutgoing,
} from "lucide-react";
import { useAgents } from "@/hooks/useAgents";
import { toast } from "sonner";
import { TestCallDialog } from "@/components/agents/TestCallDialog";

const getCountryFlag = (countryCode: string) => {
  try {
    const codePoints = countryCode
      .toUpperCase()
      .split("")
      .map((char) => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  } catch {
    return "🌐";
  }
};

const AgentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { agents, isLoading, updateAgent } = useAgents();
  const [prompt, setPrompt] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [testCallOpen, setTestCallOpen] = useState(false);

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
          {/* Test Call Button */}
          <Button
            onClick={() => setTestCallOpen(true)}
            className="gap-2"
            disabled={!agent.phone_number_id}
          >
            <PhoneOutgoing className="h-4 w-4" />
            Test Call
          </Button>
        </div>
      </motion.div>

      {/* Phone Number Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-6"
      >
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-medium flex items-center gap-2">
                  <PhoneCall className="h-4 w-4 text-primary" />
                  Phone Number
                </CardTitle>
                <CardDescription>
                  The phone number this agent uses for calls
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {agent.phone_number_id && agent.phone_number ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
                    <Phone className="h-5 w-5 text-success" />
                  </div>
                  <div>
                    <p className="font-mono text-lg">
                      {getCountryFlag(agent.phone_number.country)} {agent.phone_number.phone_number}
                    </p>
                    <p className="text-sm text-muted-foreground">Connected</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/phone-numbers">
                    Manage
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-between p-4 border border-dashed border-border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                    <Phone className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">No phone number connected</p>
                    <p className="text-sm text-muted-foreground">
                      Connect a phone number to enable calls
                    </p>
                  </div>
                </div>
                <Button size="sm" asChild>
                  <Link to="/phone-numbers">
                    Connect Number
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Agent Prompt Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
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

      {/* Test Call Dialog */}
      <TestCallDialog
        open={testCallOpen}
        onOpenChange={setTestCallOpen}
        agentId={agent.id}
        agentName={agent.name}
        hasPhoneNumber={!!agent.phone_number_id}
      />
    </PageContainer>
  );
};

export default AgentDetail;
