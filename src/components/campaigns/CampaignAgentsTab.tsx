import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Bot, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAgents } from "@/hooks/useAgents";
import { useCampaigns, CampaignWithDetails } from "@/hooks/useCampaigns";
import { useNavigate } from "react-router-dom";

interface CampaignAgentsTabProps {
  campaignId: string;
  campaign?: CampaignWithDetails;
  onViewAgent?: (agentId: string) => void;
}

const statusConfig = {
  active: { label: "Active", className: "bg-success/15 text-success" },
  inactive: { label: "Inactive", className: "bg-muted text-muted-foreground" },
  draft: { label: "Draft", className: "bg-warning/15 text-warning" },
};

export function CampaignAgentsTab({ campaignId, campaign, onViewAgent }: CampaignAgentsTabProps) {
  const navigate = useNavigate();
  const { agents: allAgents, isLoading: agentsLoading } = useAgents();
  const { linkAgent, unlinkAgent } = useCampaigns();
  const [isAttachModalOpen, setIsAttachModalOpen] = useState(false);
  const [isLinking, setIsLinking] = useState(false);

  // Get linked agents from campaign
  const linkedAgents = campaign?.agents || [];

  // Get available agents (not linked to this campaign)
  const availableAgents = useMemo(() => {
    const linkedIds = new Set(linkedAgents.map((a) => a.id));
    return allAgents.filter((agent) => !linkedIds.has(agent.id));
  }, [allAgents, linkedAgents]);

  const handleAttachAgent = async (agentId: string) => {
    setIsLinking(true);
    await linkAgent(campaignId, agentId, linkedAgents.length === 0);
    setIsLinking(false);
    setIsAttachModalOpen(false);
  };

  const handleRemoveAgent = async (agentId: string) => {
    await unlinkAgent(campaignId, agentId);
  };

  const handleViewAgent = (agentId: string) => {
    if (onViewAgent) {
      onViewAgent(agentId);
    } else {
      navigate(`/app/agents/${agentId}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Attached Agents</h3>
          <p className="text-sm text-muted-foreground">
            AI agents assigned to handle calls for this campaign
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setIsAttachModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Attach Agent
          </Button>
          <Button onClick={() => navigate("/app/agents/new")}>
            <Bot className="h-4 w-4 mr-2" />
            Create New Agent
          </Button>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border/50 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border/50 hover:bg-transparent">
              <TableHead className="text-muted-foreground font-medium">Agent Name</TableHead>
              <TableHead className="text-muted-foreground font-medium">Status</TableHead>
              <TableHead className="text-muted-foreground font-medium">Primary</TableHead>
              <TableHead className="text-muted-foreground font-medium w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {linkedAgents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                  No agents attached to this campaign
                </TableCell>
              </TableRow>
            ) : (
              linkedAgents.map((agent, index) => (
                <motion.tr
                  key={agent.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => handleViewAgent(agent.id)}
                  className="border-border/50 cursor-pointer hover:bg-muted/30"
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Bot className="h-4 w-4 text-primary" />
                      </div>
                      <span className="font-medium text-foreground">{agent.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="bg-success/15 text-success">
                      Active
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {agent.is_primary && (
                      <Badge variant="outline" className="text-xs">Primary</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveAgent(agent.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                    </Button>
                  </TableCell>
                </motion.tr>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Attach Agent Modal */}
      <Dialog open={isAttachModalOpen} onOpenChange={setIsAttachModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Attach Existing Agent</DialogTitle>
            <DialogDescription>
              Select an agent to attach to this campaign
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 mt-4">
            {agentsLoading ? (
              <p className="text-muted-foreground text-center py-4">Loading agents...</p>
            ) : availableAgents.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No available agents to attach</p>
            ) : (
              availableAgents.map((agent) => (
                <motion.button
                  key={agent.id}
                  whileHover={{ scale: 1.01 }}
                  onClick={() => handleAttachAgent(agent.id)}
                  disabled={isLinking}
                  className={cn(
                    "w-full flex items-center justify-between p-4 rounded-lg border border-border/50",
                    "hover:bg-muted/30 transition-colors text-left",
                    isLinking && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Bot className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{agent.name}</p>
                      <p className="text-sm text-muted-foreground">{agent.language || "English"}</p>
                    </div>
                  </div>
                  <Badge
                    variant="secondary"
                    className={statusConfig[agent.status || "draft"]?.className}
                  >
                    {statusConfig[agent.status || "draft"]?.label}
                  </Badge>
                </motion.button>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
