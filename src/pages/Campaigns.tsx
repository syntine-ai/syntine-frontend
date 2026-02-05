import { useState } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Megaphone, Search, Loader2, Plus, Trash2 } from "lucide-react";
import { NewCampaignModal } from "@/components/campaigns/NewCampaignModal";
import { useNavigate } from "react-router-dom";
import { useCampaigns } from "@/hooks/useCampaigns";
import { format } from "date-fns";
import { toast } from "sonner";

const Campaigns = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState("");
    const { campaigns, isLoading, error, updateCampaignStatus, createCampaign, deleteCampaign } = useCampaigns();
    const [togglingId, setTogglingId] = useState<string | null>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const filteredCampaigns = campaigns.filter((campaign) =>
        campaign.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleDelete = async (e: React.MouseEvent, id: string, name: string) => {
        e.stopPropagation(); // Prevent navigation to detail
        if (confirm(`Are you sure you want to delete campaign "${name}"? This action cannot be undone.`)) {
            await deleteCampaign(id);
        }
    };

    const handleCreateCampaign = async (data: any) => {
        await createCampaign(data);
        setIsCreateModalOpen(false);
    };

    const handleToggle = async (id: string, currentStatus: string) => {
        try {
            setTogglingId(id);
            // Toggle logic: if running -> paused, if anything else -> running
            const newStatus = currentStatus === "running" ? "paused" : "running";
            await updateCampaignStatus(id, newStatus);
            toast.success(`Campaign ${newStatus === "running" ? "started" : "paused"}`);
        } catch (err) {
            toast.error("Failed to update status");
        } finally {
            setTogglingId(null);
        }
    };

    if (isLoading) {
        return (
            <PageContainer title="All Campaigns">
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            </PageContainer>
        );
    }

    if (error) {
        return (
            <PageContainer title="All Campaigns">
                <div className="flex items-center justify-center h-64 text-destructive">
                    Error loading campaigns: {error}
                </div>
            </PageContainer>
        );
    }

    return (
        <PageContainer title="All Campaigns" actions={
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <div className="relative w-full sm:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search campaigns..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                    />
                </div>
                <Button onClick={() => setIsCreateModalOpen(true)} className="gap-2 shrink-0">
                    <Plus className="h-4 w-4" />
                    Create Campaign
                </Button>
            </div>
        }>
            {/* Table */}
            <div className="border border-border rounded-lg overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-border bg-muted/30">
                            <th className="text-left text-sm font-medium text-muted-foreground px-4 py-3">
                                Campaign Name
                            </th>
                            <th className="text-left text-sm font-medium text-muted-foreground px-4 py-3 hidden md:table-cell">
                                Connected Agent
                            </th>
                            <th className="text-left text-sm font-medium text-muted-foreground px-4 py-3 hidden sm:table-cell">
                                Concurrency
                            </th>
                            <th className="text-left text-sm font-medium text-muted-foreground px-4 py-3 hidden sm:table-cell">
                                Last Updated
                            </th>
                            <th className="text-center text-sm font-medium text-muted-foreground px-4 py-3 w-24">
                                Enabled
                            </th>
                            <th className="text-center text-sm font-medium text-muted-foreground px-4 py-3 w-16">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredCampaigns.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                                    No campaigns found.
                                </td>
                            </tr>
                        ) : (
                            filteredCampaigns.map((campaign) => (
                                <tr
                                    key={campaign.id}
                                    className="border-b border-border last:border-b-0 hover:bg-muted/20 transition-colors"
                                >
                                    <td
                                        className="px-4 py-3 cursor-pointer"
                                        onClick={() => navigate(`/campaigns/${campaign.id}`)}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                                <Megaphone className="h-4 w-4 text-primary" />
                                            </div>
                                            <div className="flex flex-col gap-0.5">
                                                <span className="text-sm font-medium text-foreground">
                                                    {campaign.name}
                                                </span>
                                                <span className="text-xs text-muted-foreground">
                                                    {(campaign as any).successRate ? `${Math.round((campaign as any).successRate)}% Success Rate` : 'No calls yet'}
                                                </span>
                                            </div>
                                        </div>
                                    </td>
                                    <td
                                        className="px-4 py-3 hidden md:table-cell cursor-pointer"
                                        onClick={() => navigate(`/campaigns/${campaign.id}`)}
                                    >
                                        <span className="text-sm text-foreground">
                                            {campaign.agents && campaign.agents.length > 0
                                                ? campaign.agents.map(a => a.name).join(", ")
                                                : <span className="text-muted-foreground italic">No agent</span>}
                                        </span>
                                    </td>
                                    <td
                                        className="px-4 py-3 hidden sm:table-cell cursor-pointer"
                                        onClick={() => navigate(`/campaigns/${campaign.id}`)}
                                    >
                                        <span className="text-sm text-foreground">
                                            {campaign.concurrency || 1}
                                        </span>
                                    </td>
                                    <td
                                        className="px-4 py-3 hidden sm:table-cell cursor-pointer"
                                        onClick={() => navigate(`/campaigns/${campaign.id}`)}
                                    >
                                        <span className="text-sm text-muted-foreground">
                                            {campaign.updated_at ? format(new Date(campaign.updated_at), "MMM d, yyyy h:mm a") : "-"}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <Switch
                                            checked={campaign.status === "running"}
                                            onCheckedChange={() => handleToggle(campaign.id, campaign.status)}
                                            disabled={togglingId === campaign.id}
                                        />
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-muted-foreground hover:text-destructive transition-colors"
                                            onClick={(e) => handleDelete(e, campaign.id, campaign.name)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <NewCampaignModal
                open={isCreateModalOpen}
                onOpenChange={setIsCreateModalOpen}
                onSubmit={handleCreateCampaign}
            />
        </PageContainer>
    );
};

export default Campaigns;
