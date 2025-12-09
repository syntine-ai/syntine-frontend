import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { OrgAppShell } from "@/components/layout/OrgAppShell";
import { PageContainer } from "@/components/layout/PageContainer";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { GlobalDateFilter, DatePreset } from "@/components/dashboard/GlobalDateFilter";
import { CampaignsTable } from "@/components/dashboard/CampaignsTable";
import { CampaignPerformanceChart } from "@/components/dashboard/CampaignPerformanceChart";
import { SkeletonMetricCards } from "@/components/shared/SkeletonCard";
import { SkeletonChart } from "@/components/shared/SkeletonChart";
import { SkeletonTable } from "@/components/shared/SkeletonTable";
import { SystemStatusPills } from "@/components/shared/SystemStatusPills";
import { Button } from "@/components/ui/button";
import { Plus, PhoneCall, PhoneIncoming, TrendingUp, Clock, Smile } from "lucide-react";
import { useNavigate } from "react-router-dom";

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

const Dashboard = () => {
  const [dateFilter, setDateFilter] = useState<DatePreset>("7d");
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Simulate loading state
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

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
              <GlobalDateFilter value={dateFilter} onChange={setDateFilter} />
              <SystemStatusPills compact />
            </div>
            <Button onClick={() => navigate("/app/campaigns")} className="gap-2">
              <Plus className="h-4 w-4" />
              New Campaign
            </Button>
          </motion.div>

          {/* Key Metrics Row */}
          <motion.div variants={itemVariants}>
            {isLoading ? (
              <SkeletonMetricCards count={5} />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <MetricCard
                  label="Total Calls"
                  value="12,847"
                  trend={12.4}
                  trendDirection="up"
                  icon={PhoneCall}
                />
                <MetricCard
                  label="Connected Calls"
                  value="10,892"
                  trend={8.2}
                  trendDirection="up"
                  icon={PhoneIncoming}
                />
                <MetricCard
                  label="Success Rate"
                  value="84.8%"
                  trend={3.5}
                  trendDirection="up"
                  icon={TrendingUp}
                />
                <MetricCard
                  label="Avg. Duration"
                  value="3m 42s"
                  trend={-2.1}
                  trendDirection="down"
                  icon={Clock}
                />
                <MetricCard
                  label="Avg. Sentiment"
                  value="72"
                  trend={5.8}
                  trendDirection="up"
                  icon={Smile}
                />
              </div>
            )}
          </motion.div>

          {/* Campaign Performance Chart */}
          <motion.div variants={itemVariants}>
            {isLoading ? (
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
            {isLoading ? (
              <SkeletonTable rows={4} columns={7} />
            ) : (
              <CampaignsTable />
            )}
          </motion.div>
        </motion.div>
      </PageContainer>
    </OrgAppShell>
  );
};

export default Dashboard;
