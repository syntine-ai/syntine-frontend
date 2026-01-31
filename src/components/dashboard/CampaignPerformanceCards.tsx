import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, TrendingUp, Phone, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getCampaignPerformance } from "@/api/services/analytics.service";
import { useAuth } from "@/contexts/AuthContext";

export function CampaignPerformanceCards() {
  const { profile } = useAuth();

  const { data: performanceData, isLoading } = useQuery({
    queryKey: ["campaign-performance", profile?.organization_id],
    queryFn: () => getCampaignPerformance(profile?.organization_id!),
    enabled: !!profile?.organization_id,
  });

  const campaigns = performanceData?.data || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8 border border-dashed rounded-lg">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground mr-2" />
        <span className="text-muted-foreground">Loading campaign performance...</span>
      </div>
    );
  }

  if (campaigns.length === 0) {
    return (
      <div className="flex items-center justify-center p-8 border border-dashed rounded-lg bg-muted/20">
        <p className="text-muted-foreground">No active campaigns data found.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {campaigns.map((campaign, index) => (
        <motion.div
          key={campaign.campaign_id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className="border-border/50 hover:border-border transition-colors h-full">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold truncate pr-4">
                  {campaign.campaign_name}
                </CardTitle>
                <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                  Active
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Campaign Id: {campaign.campaign_id.slice(0, 8)}...
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Total Calls</p>
                  <div className="flex items-center gap-1.5">
                    <Phone className="h-4 w-4 text-primary" />
                    <p className="text-2xl font-bold text-foreground">
                      {campaign.total_calls}
                    </p>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Success Rate</p>
                  <p className="text-2xl font-bold text-success">
                    {Math.round(campaign.success_rate)}%
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 pt-2 border-t border-border/50">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-success" />
                  <span className="text-sm text-muted-foreground">
                    {campaign.answered} answered
                  </span>
                </div>
                {/* We don't have rejected count in this specific endpoint yet, utilizing existing data */}
                <div className="flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {campaign.total_calls - campaign.answered} others
                  </span>
                </div>
              </div>

              <Link
                to={`/campaigns/${campaign.campaign_id}`}
                className="block text-sm text-primary hover:underline pt-2"
              >
                View campaign details →
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
