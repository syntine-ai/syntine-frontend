import { AdminAppShell } from "@/components/layout/AdminAppShell";
import { PageContainer } from "@/components/layout/PageContainer";
import { StatCard } from "@/components/shared/StatCard";
import { Building, Users, AlertTriangle, Activity } from "lucide-react";
import { motion } from "framer-motion";

const AdminDashboard = () => {
  return (
    <AdminAppShell>
      <PageContainer
        title="Admin Dashboard"
        subtitle="System overview and monitoring"
      >
        {/* Admin Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="Total Organizations"
            value="156"
            trend={{ value: 8.5, isPositive: true }}
            icon={Building}
            iconColor="primary"
          />
          <StatCard
            title="Active Users"
            value="2,847"
            trend={{ value: 12.2, isPositive: true }}
            icon={Users}
            iconColor="success"
          />
          <StatCard
            title="System Alerts"
            value="3"
            icon={AlertTriangle}
            iconColor="warning"
          />
          <StatCard
            title="API Requests (24h)"
            value="1.2M"
            trend={{ value: 5.1, isPositive: true }}
            icon={Activity}
            iconColor="primary"
          />
        </div>

        {/* System Status */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            whileHover={{ scale: 1.01 }}
            className="bg-card rounded-lg shadow-card border border-border/50 p-6"
          >
            <h2 className="text-lg font-semibold text-foreground mb-4">System Status</h2>
            <div className="space-y-4">
              {[
                { service: "API Gateway", status: "Operational", uptime: "99.99%" },
                { service: "Database Cluster", status: "Operational", uptime: "99.95%" },
                { service: "AI Processing", status: "Degraded", uptime: "98.50%" },
                { service: "Email Service", status: "Operational", uptime: "99.98%" },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                  <div>
                    <p className="font-medium text-foreground">{item.service}</p>
                    <p className="text-sm text-muted-foreground">Uptime: {item.uptime}</p>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      item.status === "Operational"
                        ? "bg-success/10 text-success"
                        : "bg-warning/10 text-warning"
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.01 }}
            className="bg-card rounded-lg shadow-card border border-border/50 p-6"
          >
            <h2 className="text-lg font-semibold text-foreground mb-4">Recent Activity</h2>
            <div className="space-y-4">
              {[
                { action: "New organization created", org: "TechStart Inc", time: "5 min ago" },
                { action: "User upgraded plan", org: "Acme Corp", time: "15 min ago" },
                { action: "API key regenerated", org: "Global Systems", time: "1 hour ago" },
                { action: "Billing updated", org: "Startup Labs", time: "2 hours ago" },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-secondary/50 rounded-lg">
                  <div className="h-8 w-8 rounded-full bg-admin-accent/10 flex items-center justify-center flex-shrink-0">
                    <Activity className="h-4 w-4 text-admin-accent" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{item.action}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.org} • {item.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </PageContainer>
    </AdminAppShell>
  );
};

export default AdminDashboard;
