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
import { Bot, Plus, Check } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface Agent {
  id: string;
  name: string;
  model: string;
  status: "online" | "offline" | "busy";
  lastUpdated: string;
  attached: boolean;
}

const mockAgents: Agent[] = [
  { id: "1", name: "Renewal Assistant", model: "GPT-4 Turbo", status: "online", lastUpdated: "2 hours ago", attached: true },
  { id: "2", name: "Lead Qualifier", model: "GPT-4 Turbo", status: "online", lastUpdated: "1 day ago", attached: true },
  { id: "3", name: "Feedback Collector", model: "GPT-3.5", status: "offline", lastUpdated: "3 days ago", attached: false },
];

const availableAgents: Agent[] = [
  { id: "4", name: "Support Bot", model: "GPT-4 Turbo", status: "online", lastUpdated: "5 hours ago", attached: false },
  { id: "5", name: "Survey Agent", model: "GPT-3.5", status: "online", lastUpdated: "12 hours ago", attached: false },
  { id: "6", name: "Upsell Assistant", model: "GPT-4", status: "offline", lastUpdated: "2 days ago", attached: false },
];

const statusConfig = {
  online: { label: "Online", className: "bg-success/15 text-success" },
  offline: { label: "Offline", className: "bg-muted text-muted-foreground" },
  busy: { label: "Busy", className: "bg-warning/15 text-warning" },
};

interface CampaignAgentsTabProps {
  onViewAgent?: (agentId: string) => void;
}

export function CampaignAgentsTab({ onViewAgent }: CampaignAgentsTabProps) {
  const [agents, setAgents] = useState<Agent[]>(mockAgents);
  const [isAttachModalOpen, setIsAttachModalOpen] = useState(false);

  const handleAttachAgent = (agentId: string) => {
    const agentToAttach = availableAgents.find(a => a.id === agentId);
    if (agentToAttach) {
      setAgents(prev => [...prev, { ...agentToAttach, attached: true }]);
    }
    setIsAttachModalOpen(false);
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
          <Button>
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
              <TableHead className="text-muted-foreground font-medium">Model</TableHead>
              <TableHead className="text-muted-foreground font-medium">Status</TableHead>
              <TableHead className="text-muted-foreground font-medium">Last Updated</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {agents.filter(a => a.attached).map((agent, index) => (
              <motion.tr
                key={agent.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => onViewAgent?.(agent.id)}
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
                <TableCell className="text-muted-foreground">{agent.model}</TableCell>
                <TableCell>
                  <Badge variant="secondary" className={statusConfig[agent.status].className}>
                    {statusConfig[agent.status].label}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">{agent.lastUpdated}</TableCell>
              </motion.tr>
            ))}
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
            {availableAgents.map((agent) => (
              <motion.button
                key={agent.id}
                whileHover={{ scale: 1.01 }}
                onClick={() => handleAttachAgent(agent.id)}
                className={cn(
                  "w-full flex items-center justify-between p-4 rounded-lg border border-border/50",
                  "hover:bg-muted/30 transition-colors text-left"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Bot className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{agent.name}</p>
                    <p className="text-sm text-muted-foreground">{agent.model}</p>
                  </div>
                </div>
                <Badge variant="secondary" className={statusConfig[agent.status].className}>
                  {statusConfig[agent.status].label}
                </Badge>
              </motion.button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
