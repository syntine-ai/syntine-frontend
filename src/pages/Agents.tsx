import { useState } from "react";
import { OrgAppShell } from "@/components/layout/OrgAppShell";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusPill } from "@/components/shared/StatusPill";
import { NewAgentModal } from "@/components/agents/NewAgentModal";
import { EmptyState } from "@/components/shared/EmptyState";
import { SkeletonTable } from "@/components/shared/SkeletonTable";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, Search, MoreVertical, Bot, Copy, Settings, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAgents, type AgentWithCampaigns } from "@/hooks/useAgents";
import { formatDistanceToNow } from "date-fns";

const Agents = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [showNewModal, setShowNewModal] = useState(false);
  
  const { agents, isLoading, duplicateAgent, deleteAgent, createAgent } = useAgents();

  const filteredAgents = agents.filter((agent) =>
    agent.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDuplicate = async (agent: AgentWithCampaigns) => {
    await duplicateAgent(agent);
  };

  const handleDelete = async (id: string) => {
    await deleteAgent(id);
  };

  const handleCreateAgent = async (data: {
    name: string;
    language: string;
    tone: "professional" | "friendly" | "casual" | "formal" | "empathetic";
    system_prompt?: string;
  }) => {
    const newAgent = await createAgent(data);
    if (newAgent) {
      setShowNewModal(false);
      navigate(`/app/agents/${newAgent.id}`);
    }
  };

  const getUpdatedText = (date: string | null) => {
    if (!date) return "Never";
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  };

  return (
    <OrgAppShell>
      <PageContainer
        title="Agents"
        subtitle="Manage your AI assistants."
        actions={
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Button className="gap-2" onClick={() => setShowNewModal(true)}>
              <Plus className="h-4 w-4" />
              New Agent
            </Button>
          </motion.div>
        }
      >
        {/* Search */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-6"
        >
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search agents..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </motion.div>

        {/* Loading State */}
        {isLoading ? (
          <SkeletonTable rows={5} columns={6} />
        ) : filteredAgents.length === 0 ? (
          /* Empty State */
          <EmptyState
            icon={Bot}
            title="No agents found"
            description={
              searchQuery
                ? "Try adjusting your search query."
                : "Create your first AI agent to power your calling campaigns."
            }
            actionLabel={searchQuery ? "Clear Search" : "Create Agent"}
            onAction={() => {
              if (searchQuery) {
                setSearchQuery("");
              } else {
                setShowNewModal(true);
              }
            }}
          />
        ) : (
          /* Agents Table */
          <div className="bg-card rounded-lg shadow-card border border-border/50 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-secondary/30">
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Name</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Linked Campaigns</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Language</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Updated</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground"></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAgents.map((agent, i) => (
                    <motion.tr
                      key={agent.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.05 }}
                      onClick={() => navigate(`/app/agents/${agent.id}`)}
                      className="border-b border-border/50 last:border-0 hover:bg-secondary/20 transition-colors cursor-pointer"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Bot className="h-5 w-5 text-primary" />
                          </div>
                          <span className="font-medium text-foreground">{agent.name}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="px-2.5 py-1 rounded-full bg-secondary text-foreground text-sm">
                          {agent.linkedCampaigns} {agent.linkedCampaigns === 1 ? "campaign" : "campaigns"}
                        </span>
                      </td>
                      <td className="p-4 text-foreground">{agent.language || "English"}</td>
                      <td className="p-4">
                        <StatusPill status={agent.status || "draft"} />
                      </td>
                      <td className="p-4 text-muted-foreground text-sm">
                        {getUpdatedText(agent.updated_at)}
                      </td>
                      <td className="p-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem 
                              className="gap-2"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDuplicate(agent);
                              }}
                            >
                              <Copy className="h-4 w-4" /> Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="gap-2" 
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/app/agents/${agent.id}`);
                              }}
                            >
                              <Settings className="h-4 w-4" /> Settings
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="gap-2 text-destructive"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(agent.id);
                              }}
                            >
                              <Trash2 className="h-4 w-4" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* New Agent Modal */}
        <NewAgentModal 
          open={showNewModal} 
          onOpenChange={setShowNewModal}
          onSubmit={handleCreateAgent}
        />
      </PageContainer>
    </OrgAppShell>
  );
};

export default Agents;
