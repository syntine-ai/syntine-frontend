import { OrgAppShell } from "@/components/layout/OrgAppShell";
import { PageContainer } from "@/components/layout/PageContainer";
import { StatCard } from "@/components/shared/StatCard";
import { StatusPill } from "@/components/shared/StatusPill";
import { Users, Zap, Bot, BarChart2 } from "lucide-react";
import { motion } from "framer-motion";

const Dashboard = () => {
  return (
    <OrgAppShell>
      <PageContainer 
        title="Dashboard" 
        subtitle="Welcome back! Here's what's happening with your campaigns."
      >
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="Total Contacts"
            value="12,847"
            trend={{ value: 12.5, isPositive: true }}
            icon={Users}
            iconColor="primary"
          />
          <StatCard
            title="Active Campaigns"
            value="24"
            trend={{ value: 8.2, isPositive: true }}
            icon={Zap}
            iconColor="success"
          />
          <StatCard
            title="AI Agents"
            value="8"
            trend={{ value: 3.1, isPositive: true }}
            icon={Bot}
            iconColor="warning"
          />
          <StatCard
            title="Conversion Rate"
            value="3.2%"
            trend={{ value: -1.4, isPositive: false }}
            icon={BarChart2}
            iconColor="destructive"
          />
        </div>

        {/* Recent Activity Placeholder */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div
            whileHover={{ scale: 1.01 }}
            className="lg:col-span-2 bg-card rounded-lg shadow-card border border-border/50 p-6"
          >
            <h2 className="text-lg font-semibold text-foreground mb-4">Recent Campaigns</h2>
            <div className="space-y-4">
              {[
                { name: "Black Friday Outreach", status: "running" as const, leads: "2,340" },
                { name: "Q4 Newsletter", status: "paused" as const, leads: "1,890" },
                { name: "Product Launch", status: "draft" as const, leads: "0" },
              ].map((campaign, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
                  <div>
                    <p className="font-medium text-foreground">{campaign.name}</p>
                    <p className="text-sm text-muted-foreground">{campaign.leads} leads</p>
                  </div>
                  <StatusPill status={campaign.status} />
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.01 }}
            className="bg-card rounded-lg shadow-card border border-border/50 p-6"
          >
            <h2 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h2>
            <div className="space-y-3">
              {["Create Campaign", "Add Contacts", "Configure Agent", "View Reports"].map((action, i) => (
                <button
                  key={i}
                  className="w-full text-left p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors text-sm font-medium text-foreground"
                >
                  {action}
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </PageContainer>
    </OrgAppShell>
  );
};

export default Dashboard;
