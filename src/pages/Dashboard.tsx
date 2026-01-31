import { useState } from "react";
import { motion } from "framer-motion";
import { PageContainer } from "@/components/layout/PageContainer";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { GlobalDateFilter } from "@/components/dashboard/GlobalDateFilter";
import { OutcomePerformanceChart } from "@/components/dashboard/OutcomePerformanceChart";
import { CampaignPerformanceCards } from "@/components/dashboard/CampaignPerformanceCards";
import { SystemStatusPills } from "@/components/shared/SystemStatusPills";
import {
  IndianRupee,
  CheckCircle2,
  ShieldCheck,
  PhoneCall,
  PhoneOff,
  PhoneIncoming,
} from "lucide-react";
import { demoOutcomeMetrics, formatCurrency } from "@/data/demoOutcomesData";

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
              value={formatCurrency(demoOutcomeMetrics.revenueRecovered)}
              caption="From confirmed orders"
              icon={IndianRupee}
              variant="primary"
            />
            <MetricCard
              label="COD Orders Confirmed"
              value={demoOutcomeMetrics.codOrdersConfirmed.toString()}
              caption="Voice-confirmed before dispatch"
              icon={CheckCircle2}
            />
            <MetricCard
              label="RTO Prevented"
              value={formatCurrency(demoOutcomeMetrics.estimatedRtoPrevented)}
              caption="Orders confirmed via voice"
              icon={ShieldCheck}
            />
            <MetricCard
              label="Calls Connected"
              value={`${demoOutcomeMetrics.callsConnectedRate}%`}
              caption="Of total outbound calls"
              icon={PhoneCall}
            />
          </div>
        </motion.div>

        {/* Secondary KPI Row */}
        <motion.div variants={itemVariants}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <MetricCard
              label="Total Calls Made"
              value={demoOutcomeMetrics.totalCallsMade.toString()}
              icon={PhoneCall}
              variant="secondary"
            />
            <MetricCard
              label="No Response"
              value={`${demoOutcomeMetrics.noResponseRate}%`}
              icon={PhoneOff}
              variant="secondary"
            />
            <MetricCard
              label="Inbound Handled"
              value={demoOutcomeMetrics.inboundCallsHandled.toString()}
              icon={PhoneIncoming}
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
