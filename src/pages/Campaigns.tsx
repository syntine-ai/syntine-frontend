import { useState } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Megaphone, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Campaign {
    id: string;
    name: string;
    lastUpdated: string;
    defaultEnabled: boolean;
}

const campaigns: Campaign[] = [
    {
        id: "order_confirmation_campaign",
        name: "Order Confirmation",
        lastUpdated: "01/28/2026, 14:30",
        defaultEnabled: true,
    },
    {
        id: "cart_abandonment_campaign",
        name: "Cart Abandonment",
        lastUpdated: "01/25/2026, 10:15",
        defaultEnabled: false,
    },
];

const Campaigns = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState("");
    const [enabledStates, setEnabledStates] = useState<Record<string, boolean>>(
        Object.fromEntries(campaigns.map((c) => [c.id, c.defaultEnabled]))
    );

    const filteredCampaigns = campaigns.filter((campaign) =>
        campaign.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleToggle = (id: string, checked: boolean) => {
        setEnabledStates((prev) => ({ ...prev, [id]: checked }));
    };

    return (
        <PageContainer title="All Campaigns" actions={
            <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                />
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
                            <th className="text-left text-sm font-medium text-muted-foreground px-4 py-3 hidden sm:table-cell">
                                Last Updated
                            </th>
                            <th className="text-center text-sm font-medium text-muted-foreground px-4 py-3 w-24">
                                Enabled
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredCampaigns.map((campaign) => (
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
                                        <span className="text-sm font-medium text-foreground">
                                            {campaign.name}
                                        </span>
                                    </div>
                                </td>
                                <td
                                    className="px-4 py-3 hidden sm:table-cell cursor-pointer"
                                    onClick={() => navigate(`/campaigns/${campaign.id}`)}
                                >
                                    <span className="text-sm text-muted-foreground">
                                        {campaign.lastUpdated}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-center">
                                    <Switch
                                        checked={enabledStates[campaign.id]}
                                        onCheckedChange={(checked) => handleToggle(campaign.id, checked)}
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </PageContainer>
    );
};

export default Campaigns;
