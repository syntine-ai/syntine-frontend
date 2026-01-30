import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  TrendingUp,
  Phone,
  Zap,
  Bot
} from "lucide-react";
import { getCampaignById, getAgentById } from "@/data/demoAgentCampaignData";

const CampaignDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const campaign = id ? getCampaignById(id) : undefined;
  const agent = campaign ? getAgentById(campaign.agentId) : undefined;

  if (!campaign) {
    return (
      <PageContainer>
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-foreground mb-2">Campaign not found</h2>
          <Button onClick={() => navigate("/campaigns")} variant="ghost">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Campaigns
          </Button>
        </div>
      </PageContainer>
    );
  }

  const isEnabled = campaign.status === "Enabled";

  return (
    <PageContainer>
      <div className="w-full">
        {/* Minimal Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/campaigns")}
            className="mb-4 pl-0 hover:bg-transparent hover:text-primary -ml-2"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Campaigns
          </Button>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                  {campaign.name}
                </h1>
                {isEnabled ? (
                  <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                    Enabled
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-muted text-muted-foreground border-border">
                    Paused
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Minimal Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Trigger Card */}
          <div className="p-4 rounded-xl border border-border bg-card shadow-sm">
            <div className="flex items-start justify-between mb-2">
              <p className="text-sm font-medium text-muted-foreground">Trigger</p>
              <Zap className="h-4 w-4 text-amber-500" />
            </div>
            <p className="font-semibold text-foreground truncate" title={campaign.trigger}>
              {campaign.trigger}
            </p>
          </div>

          {/* Last Triggered */}
          <div className="p-4 rounded-xl border border-border bg-card shadow-sm">
            <div className="flex items-start justify-between mb-2">
              <p className="text-sm font-medium text-muted-foreground">Last Run</p>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="font-semibold text-foreground">
              {campaign.metrics.lastTriggered}
            </p>
          </div>

          {/* Performance */}
          <div className="p-4 rounded-xl border border-border bg-card shadow-sm">
            <div className="flex items-start justify-between mb-2">
              <p className="text-sm font-medium text-muted-foreground">Performance</p>
              <TrendingUp className="h-4 w-4 text-emerald-500" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-bold text-foreground">
                {campaign.metrics.successRate}
              </span>
              <span className="text-sm text-muted-foreground">success</span>
            </div>
          </div>

          {/* Volume */}
          <div className="p-4 rounded-xl border border-border bg-card shadow-sm">
            <div className="flex items-start justify-between mb-2">
              <p className="text-sm font-medium text-muted-foreground">Total Volume</p>
              <Phone className="h-4 w-4 text-primary" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-bold text-foreground">
                {campaign.metrics.totalCalls}
              </span>
              <span className="text-sm text-muted-foreground">calls</span>
            </div>
          </div>
        </div>

        {/* Agent Info (Minimal) */}
        <div className="mt-6 p-4 rounded-xl border border-border bg-card/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Bot className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Agent: {campaign.agentUsed}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-primary"
            onClick={() => navigate(`/agents/${campaign.agentId}`)}
          >
            View Agent
          </Button>
        </div>

        {/* Minimal Hint */}
        <p className="mt-6 text-xs text-center text-muted-foreground/60">
          This is a transactional campaign managed by Syntine.
        </p>
      </div>
    </PageContainer>
  );
};

export default CampaignDetail;
