import { OrgAppShell } from "@/components/layout/OrgAppShell";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/shared/StatusPill";
import { Plus, Bot, MessageSquare, Zap } from "lucide-react";
import { motion } from "framer-motion";

const agents = [
  { id: 1, name: "Sales Assistant", type: "Outbound", status: "active" as const, conversations: 1245, successRate: 78.5 },
  { id: 2, name: "Support Bot", type: "Inbound", status: "active" as const, conversations: 3420, successRate: 92.1 },
  { id: 3, name: "Lead Qualifier", type: "Hybrid", status: "paused" as const, conversations: 890, successRate: 65.3 },
  { id: 4, name: "Onboarding Guide", type: "Inbound", status: "draft" as const, conversations: 0, successRate: 0 },
];

const Agents = () => {
  return (
    <OrgAppShell>
      <PageContainer
        title="AI Agents"
        subtitle="Configure and manage your conversational AI agents"
        actions={
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Create Agent
          </Button>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {agents.map((agent, i) => (
            <motion.div
              key={agent.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ scale: 1.01 }}
              className="bg-card rounded-lg shadow-card border border-border/50 p-6 cursor-pointer"
            >
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Bot className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-foreground">{agent.name}</h3>
                    <StatusPill status={agent.status} />
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">{agent.type} Agent</p>
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-foreground">{agent.conversations.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-foreground">{agent.successRate}% success</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </PageContainer>
    </OrgAppShell>
  );
};

export default Agents;
