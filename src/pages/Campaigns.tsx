import { useState } from "react";
import { OrgAppShell } from "@/components/layout/OrgAppShell";
import { PageContainer } from "@/components/layout/PageContainer";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import {
  Megaphone,
  Phone,
  CheckCircle2,
  Clock,
  TrendingUp,
  Zap,
  Info,
  Lock,
  ShoppingCart,
  AlertCircle,
} from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { mockCampaigns, getCampaignStats, type MockCampaign } from "@/data/demoAgentCampaignData";
import { AnalyticsSummaryCard } from "@/components/analytics/AnalyticsSummaryCard";
import { toast } from "sonner";

const Campaigns = () => {
  const navigate = useNavigate();
  const [campaignStatuses, setCampaignStatuses] = useState<Record<string, boolean>>(
    Object.fromEntries(mockCampaigns.map((c) => [c.id, c.status === "Enabled"]))
  );

  const stats = getCampaignStats();

  const handleToggleCampaign = (campaign: MockCampaign, checked: boolean) => {
    setCampaignStatuses((prev) => ({ ...prev, [campaign.id]: checked }));
    toast.success(
      `${campaign.name} campaign ${checked ? "enabled" : "disabled"}`
    );
  };

  const getStatusBadge = (isEnabled: boolean) => {
    if (isEnabled) {
      return (
        <Badge className="bg-success/15 text-success border-success/40 border">
          <CheckCircle2 className="h-3 w-3 mr-1" />
          Enabled
        </Badge>
      );
    }
    return (
      <Badge className="bg-muted text-muted-foreground border-border border">
        <AlertCircle className="h-3 w-3 mr-1" />
        Disabled
      </Badge>
    );
  };

  const getCampaignIcon = (campaignId: string) => {
    if (campaignId === "order_confirmation_campaign") {
      return <Phone className="h-6 w-6 text-primary" />;
    }
    return <ShoppingCart className="h-6 w-6 text-primary" />;
  };

  return (
    <OrgAppShell>
      <PageContainer
        title="Campaigns"
        subtitle="Automated voice campaigns for transactional e-commerce use cases"
      >
        {/* Summary Stats */}
        <div className="grid gap-4 md:grid-cols-3 mb-6">
          <AnalyticsSummaryCard
            title="Total Campaigns"
            value={stats.total.toString()}
            icon={Megaphone}
          />
          <AnalyticsSummaryCard
            title="Enabled"
            value={stats.enabled.toString()}
            icon={CheckCircle2}
          />
          <AnalyticsSummaryCard
            title="Total Calls"
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
            <p className="text-sm text-primary font-medium">Transactional Campaigns Only</p>
            <p className="text-sm text-primary/80">
              These campaigns are designed for order verification and cart recovery. Marketing or promotional campaigns are not supported.
            </p>
          </div>
        </motion.div>

        {/* Campaigns Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {mockCampaigns.map((campaign, index) => {
            const isEnabled = campaignStatuses[campaign.id];
            return (
              <motion.div
                key={campaign.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.3 }}
              >
                <Card
                  className="border-border/50 hover:shadow-md transition-all cursor-pointer h-full"
                  onClick={() => navigate(`/app/campaigns/${campaign.id}`)}
                >
                  <CardContent className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                        {getCampaignIcon(campaign.id)}
                      </div>
                      {getStatusBadge(isEnabled)}
                    </div>

                    {/* Campaign Info */}
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      {campaign.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {campaign.triggerDescription}
                    </p>

                    {/* Trigger Badge */}
                    <div className="mb-4">
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50 border border-border/50">
                        <Zap className="h-3.5 w-3.5 text-warning" />
                        <span className="text-sm text-foreground">
                          Trigger: <span className="font-medium">{campaign.trigger}</span>
                        </span>
                      </div>
                    </div>

                    {/* Agent Used */}
                    <div className="mb-4 p-3 rounded-lg bg-muted/50">
                      <p className="text-xs text-muted-foreground mb-1">Agent Used</p>
                      <p className="text-sm font-medium text-foreground">{campaign.agentUsed}</p>
                    </div>

                    {/* Metrics */}
                    <div className="grid grid-cols-3 gap-3 mb-4">
                      <div className="text-center p-2 rounded-lg bg-muted/30">
                        <p className="text-xs text-muted-foreground mb-0.5">Last Run</p>
                        <p className="text-sm font-medium text-foreground">
                          {campaign.metrics.lastTriggered}
                        </p>
                      </div>
                      <div className="text-center p-2 rounded-lg bg-muted/30">
                        <p className="text-xs text-muted-foreground mb-0.5">Success</p>
                        <p className="text-sm font-medium text-foreground">
                          {campaign.metrics.successRate}
                        </p>
                      </div>
                      <div className="text-center p-2 rounded-lg bg-muted/30">
                        <p className="text-xs text-muted-foreground mb-0.5">Calls</p>
                        <p className="text-sm font-medium text-foreground">
                          {campaign.metrics.totalCalls}
                        </p>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-4 border-t border-border/50">
                      <span className="text-sm text-muted-foreground">
                        {isEnabled ? "Campaign is running" : "Campaign is paused"}
                      </span>
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-2"
                      >
                        <span className="text-xs text-muted-foreground">
                          {isEnabled ? "On" : "Off"}
                        </span>
                        <Switch
                          checked={isEnabled}
                          onCheckedChange={(checked) =>
                            handleToggleCampaign(campaign, checked)
                          }
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
            {[
              "Create Campaign",
              "Edit Trigger",
              "Change Agent",
              "Retry Rules",
              "Contact Lists",
              "Marketing Campaigns",
            ].map((item) => (
              <Badge key={item} variant="outline" className="text-muted-foreground">
                {item}
              </Badge>
            ))}
          </div>
        </motion.div>
      </PageContainer>
    </OrgAppShell>
  );
};

export default Campaigns;
