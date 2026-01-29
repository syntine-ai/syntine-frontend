import { useState } from "react";
import { OrgAppShell } from "@/components/layout/OrgAppShell";
import { PageContainer } from "@/components/layout/PageContainer";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import {
  Bot,
  Phone,
  PhoneIncoming,
  TrendingUp,
  CheckCircle2,
  Info,
  Lock,
} from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { mockAgents, getAgentStats, type MockAgent } from "@/data/demoAgentCampaignData";
import { AnalyticsSummaryCard } from "@/components/analytics/AnalyticsSummaryCard";
import { toast } from "sonner";

const Agents = () => {
  const navigate = useNavigate();
  const [agentStatuses, setAgentStatuses] = useState<Record<string, boolean>>(
    Object.fromEntries(mockAgents.map((a) => [a.id, a.status === "Active"]))
  );

  const stats = getAgentStats();

  const handleToggleAgent = (agent: MockAgent, checked: boolean) => {
    if (!agent.canToggle) {
      toast.info("This agent cannot be disabled as it handles inbound calls.");
      return;
    }
    setAgentStatuses((prev) => ({ ...prev, [agent.id]: checked }));
    toast.success(`${agent.name} ${checked ? "activated" : "deactivated"}`);
  };

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

  const getStatusBadge = (isActive: boolean) => {
    if (isActive) {
      return (
        <Badge className="bg-success/15 text-success border-success/40 border">
          <CheckCircle2 className="h-3 w-3 mr-1" />
          Active
        </Badge>
      );
    }
    return (
      <Badge className="bg-muted text-muted-foreground border-border border">
        Inactive
      </Badge>
    );
  };

  return (
    <OrgAppShell>
      <PageContainer
        title="Voice Agents"
        subtitle="Pre-built AI voice agents designed for e-commerce automation"
      >
        {/* Summary Stats */}
        <div className="grid gap-4 md:grid-cols-3 mb-6">
          <AnalyticsSummaryCard
            title="Total Agents"
            value={stats.total.toString()}
            icon={Bot}
          />
          <AnalyticsSummaryCard
            title="Active Agents"
            value={stats.active.toString()}
            icon={CheckCircle2}
          />
          <AnalyticsSummaryCard
            title="Total Calls Handled"
            value={stats.totalCalls.toString()}
            icon={Phone}
          />
        </div>

        {/* System Notice */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 rounded-xl bg-primary/10 border border-primary/20 flex items-start gap-3"
        >
          <Info className="h-5 w-5 text-primary mt-0.5 shrink-0" />
          <div>
            <p className="text-sm text-primary font-medium">System-Managed Agents</p>
            <p className="text-sm text-primary/80">
              These agents are pre-configured for e-commerce use cases. You can enable or disable them, but customization is not available in this version.
            </p>
          </div>
        </motion.div>

        {/* Agents Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {mockAgents.map((agent, index) => {
            const isActive = agentStatuses[agent.id];
            return (
              <motion.div
                key={agent.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.3 }}
              >
                <Card
                  className="border-border/50 hover:shadow-md transition-all cursor-pointer h-full"
                  onClick={() => navigate(`/app/agents/${agent.id}`)}
                >
                  <CardContent className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Bot className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex items-center gap-2">
                        {getTypeBadge(agent.type)}
                      </div>
                    </div>

                    {/* Agent Info */}
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      {agent.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {agent.purpose}
                    </p>

                    {/* Metrics */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="p-3 rounded-lg bg-muted/50">
                        <p className="text-xs text-muted-foreground mb-1">Calls Handled</p>
                        <p className="text-lg font-semibold text-foreground">
                          {agent.metrics.callsHandled}
                        </p>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/50">
                        <p className="text-xs text-muted-foreground mb-1">
                          {agent.metrics.successRate ? "Success Rate" : "Resolution Rate"}
                        </p>
                        <p className="text-lg font-semibold text-foreground">
                          {agent.metrics.successRate || agent.metrics.resolutionRate}
                        </p>
                      </div>
                    </div>

                    {/* Used By */}
                    <div className="mb-4">
                      <p className="text-xs text-muted-foreground mb-1.5">Used by</p>
                      <div className="flex flex-wrap gap-1.5">
                        {agent.usedBy.map((use) => (
                          <Badge
                            key={use}
                            variant="outline"
                            className="text-xs font-normal"
                          >
                            {use}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-4 border-t border-border/50">
                      <div className="flex items-center gap-2">
                        {getStatusBadge(isActive)}
                        {!agent.canToggle && (
                          <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                        )}
                      </div>
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-2"
                      >
                        <span className="text-xs text-muted-foreground">
                          {isActive ? "On" : "Off"}
                        </span>
                        <Switch
                          checked={isActive}
                          onCheckedChange={(checked) => handleToggleAgent(agent, checked)}
                          disabled={!agent.canToggle}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Restrictions Notice */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 p-4 rounded-xl bg-muted/50 border border-border/50"
        >
          <div className="flex items-center gap-2 mb-2">
            <Lock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">What's not available</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {["Create Agent", "Edit Agent", "Delete Agent", "Duplicate Agent", "Custom Prompts"].map(
              (item) => (
                <Badge key={item} variant="outline" className="text-muted-foreground">
                  {item}
                </Badge>
              )
            )}
          </div>
        </motion.div>
      </PageContainer>
    </OrgAppShell>
  );
};

export default Agents;
