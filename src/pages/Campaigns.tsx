import { OrgAppShell } from "@/components/layout/OrgAppShell";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusPill } from "@/components/shared/StatusPill";
import { NewCampaignModal } from "@/components/campaigns/NewCampaignModal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, Search, MoreVertical, Play, Pause, Settings, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const campaigns = [
  {
    id: "1",
    name: "Renewal Follow-up",
    status: "running" as const,
    agent: "Sales Assistant",
    concurrency: 5,
    callsToday: 134,
    successRate: 82.5,
    lastRun: "2 min ago",
  },
  {
    id: "2",
    name: "Customer Feedback",
    status: "running" as const,
    agent: "Feedback Collector",
    concurrency: 3,
    callsToday: 89,
    successRate: 91.2,
    lastRun: "5 min ago",
  },
  {
    id: "3",
    name: "Lead Qualification",
    status: "paused" as const,
    agent: "Lead Qualifier",
    concurrency: 4,
    callsToday: 0,
    successRate: 76.8,
    lastRun: "2 hours ago",
  },
  {
    id: "4",
    name: "Onboarding Calls",
    status: "draft" as const,
    agent: "Support Bot",
    concurrency: 2,
    callsToday: 0,
    successRate: 0,
    lastRun: "Never",
  },
  {
    id: "5",
    name: "Subscription Upgrade",
    status: "running" as const,
    agent: "Sales Assistant",
    concurrency: 6,
    callsToday: 67,
    successRate: 85.3,
    lastRun: "1 min ago",
  },
];

const Campaigns = () => {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showNewModal, setShowNewModal] = useState(false);

  const filteredCampaigns = campaigns.filter((campaign) => {
    const matchesStatus = statusFilter === "all" || campaign.status === statusFilter;
    const matchesSearch = campaign.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <OrgAppShell>
      <PageContainer
        title="Campaigns"
        subtitle="Manage and monitor all AI calling campaigns."
        actions={
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Button className="gap-2" onClick={() => setShowNewModal(true)}>
              <Plus className="h-4 w-4" />
              New Campaign
            </Button>
          </motion.div>
        }
      >
        {/* Filters */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col sm:flex-row gap-4 mb-6"
        >
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="running">Running</SelectItem>
              <SelectItem value="paused">Paused</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
            </SelectContent>
          </Select>
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search campaigns..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </motion.div>

        {/* Campaigns Table */}
        <div className="bg-card rounded-lg shadow-card border border-border/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-secondary/30">
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Name</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Agent</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Concurrency</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Calls Today</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Success Rate</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Last Run</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground"></th>
                </tr>
              </thead>
              <tbody>
                {filteredCampaigns.map((campaign, i) => (
                  <motion.tr
                    key={campaign.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => navigate(`/campaigns/${campaign.id}`)}
                    className="border-b border-border/50 last:border-0 hover:bg-secondary/20 transition-colors cursor-pointer"
                  >
                    <td className="p-4">
                      <span className="font-medium text-foreground">{campaign.name}</span>
                    </td>
                    <td className="p-4">
                      <StatusPill status={campaign.status} />
                    </td>
                    <td className="p-4 text-foreground">{campaign.agent}</td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                        {campaign.concurrency}x
                      </span>
                    </td>
                    <td className="p-4 text-foreground font-medium">{campaign.callsToday}</td>
                    <td className="p-4">
                      <span
                        className={
                          campaign.successRate >= 80
                            ? "text-success font-medium"
                            : campaign.successRate >= 60
                            ? "text-warning font-medium"
                            : "text-destructive font-medium"
                        }
                      >
                        {campaign.successRate}%
                      </span>
                    </td>
                    <td className="p-4 text-muted-foreground text-sm">{campaign.lastRun}</td>
                    <td className="p-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem className="gap-2">
                            {campaign.status === "running" ? (
                              <>
                                <Pause className="h-4 w-4" /> Pause
                              </>
                            ) : (
                              <>
                                <Play className="h-4 w-4" /> Start
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2">
                            <Settings className="h-4 w-4" /> Settings
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2 text-destructive">
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

        {/* New Campaign Modal */}
        <NewCampaignModal open={showNewModal} onOpenChange={setShowNewModal} />
      </PageContainer>
    </OrgAppShell>
  );
};

export default Campaigns;
