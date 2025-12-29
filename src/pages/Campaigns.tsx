import { useState } from "react";
import { OrgAppShell } from "@/components/layout/OrgAppShell";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusPill } from "@/components/shared/StatusPill";
import { NewCampaignModal } from "@/components/campaigns/NewCampaignModal";
import { EmptyState } from "@/components/shared/EmptyState";
import { SkeletonTable } from "@/components/shared/SkeletonTable";
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
import { Plus, Search, MoreVertical, Play, Pause, Settings, Trash2, Megaphone } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useCampaigns, type CampaignWithDetails } from "@/hooks/useCampaigns";
import { formatDistanceToNow } from "date-fns";

const Campaigns = () => {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showNewModal, setShowNewModal] = useState(false);

  const { campaigns, isLoading, updateCampaignStatus, deleteCampaign, createCampaign } = useCampaigns();

  const filteredCampaigns = campaigns.filter((campaign) => {
    const matchesStatus = statusFilter === "all" || campaign.status === statusFilter;
    const matchesSearch = campaign.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleToggleCampaign = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "running" ? "paused" : "running";
    await updateCampaignStatus(id, newStatus as any);
  };

  const handleDeleteCampaign = async (id: string) => {
    await deleteCampaign(id);
  };

  const handleCreateCampaign = async (data: {
    name: string;
    description?: string;
    concurrency?: number;
    agentIds?: string[];
    contactListIds?: string[];
  }) => {
    const newCampaign = await createCampaign(data);
    if (newCampaign) {
      setShowNewModal(false);
      navigate(`/app/campaigns/${newCampaign.id}`);
    }
  };

  const getLastRunText = (campaign: CampaignWithDetails) => {
    if (campaign.started_at) {
      return formatDistanceToNow(new Date(campaign.started_at), { addSuffix: true });
    }
    return "Never";
  };

  const getPrimaryAgentName = (campaign: CampaignWithDetails) => {
    const primary = campaign.agents.find((a) => a.is_primary);
    if (primary) return primary.name;
    if (campaign.agents.length > 0) return campaign.agents[0].name;
    return "No agent";
  };

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
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
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

        {/* Loading State */}
        {isLoading ? (
          <SkeletonTable rows={5} columns={8} />
        ) : filteredCampaigns.length === 0 ? (
          /* Empty State */
          <EmptyState
            icon={Megaphone}
            title="No campaigns found"
            description={
              searchQuery || statusFilter !== "all"
                ? "Try adjusting your filters or search query."
                : "Get started by creating your first AI calling campaign."
            }
            actionLabel={searchQuery || statusFilter !== "all" ? "Clear Filters" : "Create Campaign"}
            onAction={() => {
              if (searchQuery || statusFilter !== "all") {
                setSearchQuery("");
                setStatusFilter("all");
              } else {
                setShowNewModal(true);
              }
            }}
          />
        ) : (
          /* Campaigns Table */
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
                      onClick={() => navigate(`/app/campaigns/${campaign.id}`)}
                      className="border-b border-border/50 last:border-0 hover:bg-secondary/20 transition-colors cursor-pointer"
                    >
                      <td className="p-4">
                        <span className="font-medium text-foreground">{campaign.name}</span>
                      </td>
                      <td className="p-4">
                        <StatusPill status={campaign.status || "draft"} />
                      </td>
                      <td className="p-4 text-foreground">{getPrimaryAgentName(campaign)}</td>
                      <td className="p-4">
                        <span className="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                          {campaign.concurrency || 1}x
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
                              : campaign.successRate > 0
                              ? "text-destructive font-medium"
                              : "text-muted-foreground"
                          }
                        >
                          {campaign.successRate > 0 ? `${campaign.successRate.toFixed(1)}%` : "-"}
                        </span>
                      </td>
                      <td className="p-4 text-muted-foreground text-sm">{getLastRunText(campaign)}</td>
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
                                handleToggleCampaign(campaign.id, campaign.status || "draft");
                              }}
                            >
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
                            <DropdownMenuItem 
                              className="gap-2" 
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/app/campaigns/${campaign.id}`);
                              }}
                            >
                              <Settings className="h-4 w-4" /> Settings
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="gap-2 text-destructive"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteCampaign(campaign.id);
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

        {/* New Campaign Modal */}
        <NewCampaignModal 
          open={showNewModal} 
          onOpenChange={setShowNewModal}
          onSubmit={handleCreateCampaign}
        />
      </PageContainer>
    </OrgAppShell>
  );
};

export default Campaigns;
