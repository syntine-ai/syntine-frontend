import { useState } from "react";
import { motion } from "framer-motion";
import { OrgAppShell } from "@/components/layout/OrgAppShell";
import { PageContainer } from "@/components/layout/PageContainer";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { GlobalDateFilter } from "@/components/dashboard/GlobalDateFilter";
import { CampaignPerformanceChart } from "@/components/dashboard/CampaignPerformanceChart";
import { SkeletonMetricCards } from "@/components/shared/SkeletonCard";
import { SkeletonChart } from "@/components/shared/SkeletonChart";
import { SkeletonTable } from "@/components/shared/SkeletonTable";
import { SystemStatusPills } from "@/components/shared/SystemStatusPills";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, PhoneCall, PhoneIncoming, TrendingUp, Clock, Smile, Megaphone } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDashboardMetrics, useActiveCampaigns } from "@/hooks/useDashboardData";
import { format } from "date-fns";

type DashboardDatePreset = "7d" | "30d" | "90d";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

function formatDuration(seconds: number): string {
  if (seconds === 0) return "0s";
  const mins = Math.floor(seconds / 60);
  const secs = Math.round(seconds % 60);
  if (mins === 0) return `${secs}s`;
  return `${mins}m ${secs}s`;
}

function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toLocaleString();
}

const statusColors: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  scheduled: "bg-info/10 text-info",
  running: "bg-success/10 text-success",
  paused: "bg-warning/10 text-warning",
  completed: "bg-primary/10 text-primary",
  cancelled: "bg-destructive/10 text-destructive",
};

const Dashboard = () => {
  const [dateFilter, setDateFilter] = useState<DashboardDatePreset>("7d");
  const navigate = useNavigate();

  const { data: metrics, isLoading: metricsLoading } = useDashboardMetrics(dateFilter);
  const { data: campaigns, isLoading: campaignsLoading } = useActiveCampaigns();

  return (
    <OrgAppShell>
      <PageContainer
        title="Campaign Overview"
        subtitle="Monitor campaign performance, call metrics, and system health."
      >
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          {/* Header Row */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="flex items-center gap-4">
              <GlobalDateFilter 
                value={dateFilter} 
                onChange={(v) => {
                  if (v === "7d" || v === "30d" || v === "90d") {
                    setDateFilter(v);
                  }
                }} 
              />
              <SystemStatusPills compact />
            </div>
            <Button onClick={() => navigate("/app/campaigns")} className="gap-2">
              <Plus className="h-4 w-4" />
              New Campaign
            </Button>
          </motion.div>

          {/* Key Metrics Row */}
          <motion.div variants={itemVariants}>
            {metricsLoading ? (
              <SkeletonMetricCards count={5} />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <MetricCard
                  label="Total Calls"
                  value={formatNumber(metrics?.totalCalls || 0)}
                  icon={PhoneCall}
                />
                <MetricCard
                  label="Connected Calls"
                  value={formatNumber(metrics?.answeredCalls || 0)}
                  icon={PhoneIncoming}
                />
                <MetricCard
                  label="Success Rate"
                  value={`${(metrics?.successRate || 0).toFixed(1)}%`}
                  icon={TrendingUp}
                />
                <MetricCard
                  label="Avg. Duration"
                  value={formatDuration(metrics?.avgDuration || 0)}
                  icon={Clock}
                />
                <MetricCard
                  label="Avg. Sentiment"
                  value={Math.round(metrics?.avgSentiment || 0).toString()}
                  icon={Smile}
                />
              </div>
            )}
          </motion.div>

          {/* Campaign Performance Chart */}
          <motion.div variants={itemVariants}>
            {metricsLoading ? (
              <SkeletonChart />
            ) : (
              <CampaignPerformanceChart />
            )}
          </motion.div>

          {/* Campaigns Table */}
          <motion.div variants={itemVariants}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">Active Campaigns</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/app/campaigns")}
                className="text-muted-foreground"
              >
                View all
              </Button>
            </div>
            {campaignsLoading ? (
              <SkeletonTable rows={4} columns={5} />
            ) : campaigns && campaigns.length > 0 ? (
              <div className="bg-card border border-border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Campaign</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Started</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {campaigns.map((campaign) => (
                      <TableRow 
                        key={campaign.id} 
                        className="cursor-pointer hover:bg-muted/30"
                        onClick={() => navigate(`/app/campaigns/${campaign.id}`)}
                      >
                        <TableCell className="font-medium">{campaign.name}</TableCell>
                        <TableCell>
                          <Badge className={statusColors[campaign.status] || "bg-muted"}>
                            {campaign.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {campaign.started_at ? format(new Date(campaign.started_at), "MMM d, yyyy") : "-"}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {format(new Date(campaign.created_at), "MMM d, yyyy")}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <EmptyState
                icon={Megaphone}
                title="No campaigns yet"
                description="Create your first campaign to start making calls."
                actionLabel="Create Campaign"
                onAction={() => navigate("/app/campaigns")}
              />
            )}
          </motion.div>
        </motion.div>
      </PageContainer>
    </OrgAppShell>
  );
};

export default Dashboard;