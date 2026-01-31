import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { PageContainer } from "@/components/layout/PageContainer";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { GlobalDateFilter } from "@/components/dashboard/GlobalDateFilter";
import { OutcomePerformanceChart } from "@/components/dashboard/OutcomePerformanceChart";
import { CampaignPerformanceCards } from "@/components/dashboard/CampaignPerformanceCards";
import { SystemStatusPills } from "@/components/shared/SystemStatusPills";
import { useAuth } from "@/contexts/AuthContext";
import { getOutcomeMetrics } from "@/api/services/analytics.service";
import { useQuery } from "@tanstack/react-query";
import {
  IndianRupee,
  CheckCircle2,
  ShieldCheck,
  PhoneCall,
  PhoneOff,
  PhoneIncoming,
} from "lucide-react";

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

const Dashboard = () => {
  const [dateFilter, setDateFilter] = useState<DashboardDatePreset>("7d");
  const { profile } = useAuth();

  // Map dashboard date filter to analytics period
  const period = useMemo(() => {
    if (dateFilter === "7d") return "week";
    if (dateFilter === "30d") return "last_30_days";
    return "last_30_days"; // 90d fallback
  }, [dateFilter]);

  // Fetch outcome metrics from real analytics service
  const { data: outcomeMetrics, isLoading, error } = useQuery({
    queryKey: ["outcome-metrics", profile?.organization_id, period],
    queryFn: () => getOutcomeMetrics(profile?.organization_id!, { period }),
    enabled: !!profile?.organization_id,
    staleTime: 30000, // Cache for 30 seconds
  });

  // Helper: Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Show loading state
  if (isLoading) {
    return (
      <PageContainer
        title="Outcomes Overview"
        subtitle="Track how AI voice calls impact orders and revenue."
      >
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading dashboard data...</div>
        </div>
      </PageContainer>
    );
  }

  // Show error state
  if (error) {
    return (
      <PageContainer
        title="Outcomes Overview"
        subtitle="Track how AI voice calls impact orders and revenue."
      >
        <div className="flex items-center justify-center h-64">
          <div className="text-destructive">
            Failed to load dashboard data. Please try again.
          </div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title="Outcomes Overview"
      subtitle="Track how AI voice calls impact orders and revenue."
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
        </motion.div>

        {/* Primary KPI Cards */}
        <motion.div variants={itemVariants}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              label="Revenue Recovered"
              value={formatCurrency(outcomeMetrics?.revenue_recovered || 0)}
              caption="From confirmed orders"
              icon={IndianRupee}
              variant="primary"
            />
            <MetricCard
              label="COD Orders Confirmed"
              value={(outcomeMetrics?.cod_confirmed || 0).toString()}
              caption="Voice-confirmed before dispatch"
              icon={CheckCircle2}
            />
            <MetricCard
              label="RTO Prevented"
              value={(outcomeMetrics?.rto_prevented || 0).toString()}
              caption="Orders confirmed via voice"
              icon={ShieldCheck}
            />
            <MetricCard
              label="Carts Recovered"
              value={(outcomeMetrics?.carts_recovered || 0).toString()}
              caption="Abandoned carts recovered"
              icon={PhoneCall}
            />
          </div>
        </motion.div>

        {/* Secondary KPI Row - Using existing auth hook data */}
        <motion.div variants={itemVariants}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <MetricCard
              label="COD Confirmed"
              value={(outcomeMetrics?.cod_confirmed || 0).toString()}
              icon={CheckCircle2}
              variant="secondary"
            />
            <MetricCard
              label="Carts Recovered"
              value={(outcomeMetrics?.carts_recovered || 0).toString()}
              icon={PhoneCall}
              variant="secondary"
            />
            <MetricCard
              label="Revenue"
              value={formatCurrency(outcomeMetrics?.revenue_recovered || 0)}
              icon={IndianRupee}
              variant="secondary"
            />
          </div>
        </motion.div>

        {/* Outcomes Chart */}
        <motion.div variants={itemVariants}>
          <OutcomePerformanceChart />
        </motion.div>

        {/* Campaign Performance Cards */}
        <motion.div variants={itemVariants}>
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-foreground">
              Campaign Performance
            </h2>
            <p className="text-sm text-muted-foreground">
              Transactional campaigns for orders
            </p>
          </div>
          <CampaignPerformanceCards />
        </motion.div>
      </motion.div>
    </PageContainer>
  );
};

export default Dashboard;
