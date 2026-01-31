import { useEffect } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Clock,
  TrendingUp,
  Phone,
  Zap,
  Bot,
  Loader2
} from "lucide-react";
import { useCampaigns } from "@/hooks/useCampaigns";
import { format } from "date-fns";

const CampaignDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { campaigns, isLoading, refetch } = useCampaigns();

  const campaign = campaigns.find((c) => c.id === id);
  // Find primary agent or first linked agent
  const agent = campaign?.agents?.find(a => a.is_primary) || campaign?.agents?.[0];

  useEffect(() => {
    // Determine if we need to refetch to get fresh stats
    if (campaigns.length === 0 && !isLoading) {
      refetch();
    }
  }, [campaigns.length, isLoading, refetch]);

  if (isLoading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </PageContainer>
    );
  }

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

  const isEnabled = campaign.status === "running";

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
                    Running
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-muted text-muted-foreground border-border">
                    {campaign.status}
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground">{campaign.description}</p>
            </div>
          </div>
        </div>

        {/* Minimal Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Trigger Card - Using ID as proxy for trigger type until we have that field or use config */}
          <div className="p-4 rounded-xl border border-border bg-card shadow-sm">
            <div className="flex items-start justify-between mb-2">
              <p className="text-sm font-medium text-muted-foreground">Concurrency</p>
              <Zap className="h-4 w-4 text-amber-500" />
            </div>
            <p className="font-semibold text-foreground truncate">
              {campaign.concurrency} concurrent calls
            </p>
          </div>

          {/* Last Updated */}
          <div className="p-4 rounded-xl border border-border bg-card shadow-sm">
            <div className="flex items-start justify-between mb-2">
              <p className="text-sm font-medium text-muted-foreground">Latest Activity</p>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="font-semibold text-foreground">
              {campaign.updated_at ? format(new Date(campaign.updated_at), "MMM d, h:mm a") : "N/A"}
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
                {Math.round(campaign.successRate)}%
              </span>
              <span className="text-sm text-muted-foreground">success</span>
            </div>
          </div>

          {/* Volume */}
          <div className="p-4 rounded-xl border border-border bg-card shadow-sm">
            <div className="flex items-start justify-between mb-2">
              <p className="text-sm font-medium text-muted-foreground">Today's Volume</p>
              <Phone className="h-4 w-4 text-primary" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-bold text-foreground">
                {campaign.callsToday}
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
              <p className="text-sm font-medium text-foreground">
                Agent: {agent ? agent.name : "No agent assigned"}
              </p>
            </div>
          </div>
          {agent && (
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-primary"
              onClick={() => navigate(`/agents/${agent.id}`)}
            >
              View Agent
            </Button>
          )}
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
