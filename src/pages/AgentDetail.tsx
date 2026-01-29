import { OrgAppShell } from "@/components/layout/OrgAppShell";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Bot,
  ArrowLeft,
  Phone,
  PhoneIncoming,
  CheckCircle2,
  Database,
  Shield,
  Lightbulb,
  Lock,
} from "lucide-react";
import { getAgentById, type MockAgent } from "@/data/demoAgentCampaignData";

const AgentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const agent = id ? getAgentById(id) : undefined;

  if (!agent) {
    return (
      <OrgAppShell>
        <PageContainer>
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold text-foreground mb-2">Agent not found</h2>
            <p className="text-muted-foreground mb-4">The agent you're looking for doesn't exist.</p>
            <Button onClick={() => navigate("/app/agents")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Agents
            </Button>
          </div>
        </PageContainer>
      </OrgAppShell>
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

          {/* Metrics Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-card border border-border/50">
              <p className="text-sm text-muted-foreground mb-1">Calls Handled</p>
              <p className="text-2xl font-semibold text-foreground">{agent.metrics.callsHandled}</p>
            </div>
            <div className="p-4 rounded-xl bg-card border border-border/50">
              <p className="text-sm text-muted-foreground mb-1">
                {agent.metrics.successRate ? "Success Rate" : "Resolution Rate"}
              </p>
              <p className="text-2xl font-semibold text-foreground">
                {agent.metrics.successRate || agent.metrics.resolutionRate}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-card border border-border/50">
              <p className="text-sm text-muted-foreground mb-1">Used By</p>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {agent.usedBy.map((use) => (
                  <Badge key={use} variant="outline" className="text-xs">
                    {use}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="space-y-6">
          {/* Purpose Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Lightbulb className="h-5 w-5 text-primary" />
                  What this agent does
                </CardTitle>
                <CardDescription>
                  A plain-English explanation of this agent's purpose
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-foreground leading-relaxed">{agent.purpose}</p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Scenarios Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <CheckCircle2 className="h-5 w-5 text-success" />
                  Supported Scenarios
                </CardTitle>
                <CardDescription>
                  Situations this agent is designed to handle
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {agent.details.scenarios.map((scenario, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="h-6 w-6 rounded-full bg-success/10 flex items-center justify-center shrink-0 mt-0.5">
                        <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                      </div>
                      <span className="text-foreground">{scenario}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </motion.div>

          {/* Data Used Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Database className="h-5 w-5 text-primary" />
                  Data Used
                </CardTitle>
                <CardDescription>
                  Information this agent accesses during calls
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {agent.details.dataUsed.map((data) => (
                    <Badge
                      key={data}
                      variant="secondary"
                      className="px-3 py-1.5 text-sm"
                    >
                      {data}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Compliance Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Shield className="h-5 w-5 text-warning" />
                  Compliance & Safety
                </CardTitle>
                <CardDescription>
                  How this agent protects you and your customers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="p-4 rounded-lg bg-warning/10 border border-warning/20">
                  <p className="text-foreground leading-relaxed">
                    {agent.details.complianceNote}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Restrictions Notice */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="p-4 rounded-xl bg-muted/50 border border-border/50">
              <div className="flex items-center gap-2 mb-2">
                <Lock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">
                  This agent is read-only
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                Agent customization, prompt editing, and behavior modification are not available in this version.
                All agents are pre-configured and managed by the system for optimal performance.
              </p>
            </div>
          </motion.div>
        </div>
      </PageContainer>
    </OrgAppShell>
  );
};

export default AgentDetail;
