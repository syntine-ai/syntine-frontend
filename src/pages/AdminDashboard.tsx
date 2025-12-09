import { useState } from "react";
import { AdminAppShell } from "@/components/layout/AdminAppShell";
import { PageContainer } from "@/components/layout/PageContainer";
import { AdminMetricCard } from "@/components/admin/AdminMetricCard";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  Building2,
  Zap,
  PhoneCall,
  AlertTriangle,
  Activity,
  TrendingUp,
} from "lucide-react";

// Mock data for charts
const callsOverTimeData = [
  { date: "Jan 1", calls: 2400, answered: 1800 },
  { date: "Jan 5", calls: 3200, answered: 2400 },
  { date: "Jan 10", calls: 4100, answered: 3100 },
  { date: "Jan 15", calls: 3800, answered: 2900 },
  { date: "Jan 20", calls: 5200, answered: 4000 },
  { date: "Jan 25", calls: 4800, answered: 3700 },
  { date: "Jan 30", calls: 5600, answered: 4300 },
];

const topOrgsData = [
  { name: "Acme Corp", calls: 2840 },
  { name: "TechStart", calls: 2120 },
  { name: "Global Sys", calls: 1890 },
  { name: "InnovateCo", calls: 1540 },
  { name: "StartupLab", calls: 1280 },
];

const recentActivity = [
  { action: "New organization created", org: "FinanceFirst Ltd", time: "3 min ago" },
  { action: "User upgraded to Pro plan", org: "Acme Corp", time: "12 min ago" },
  { action: "Campaign completed successfully", org: "TechStart Inc", time: "28 min ago" },
  { action: "API key regenerated", org: "Global Systems", time: "1 hour ago" },
  { action: "Billing updated", org: "Startup Labs", time: "2 hours ago" },
];

const AdminDashboard = () => {
  return (
    <AdminAppShell>
      <PageContainer
        title="Admin Dashboard"
        subtitle="System-wide overview and monitoring"
      >
        {/* Metric Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <AdminMetricCard
            title="Total Organizations"
            value="42"
            trend="+5.1%"
            icon={Building2}
            delay={0}
          />
          <AdminMetricCard
            title="Active Organizations"
            value="38"
            trend="+3.4%"
            icon={Zap}
            delay={0.05}
          />
          <AdminMetricCard
            title="Calls Today"
            value="12,820"
            trend="+8.2%"
            icon={PhoneCall}
            delay={0.1}
          />
          <AdminMetricCard
            title="Error Rate"
            value="0.48%"
            trend="-12%"
            icon={AlertTriangle}
            delay={0.15}
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Calls Over Time Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card rounded-xl border border-border/50 p-6 shadow-sm"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-base font-semibold text-foreground">
                  Calls Over Time
                </h3>
                <p className="text-sm text-muted-foreground">
                  All organizations combined
                </p>
              </div>
              <div className="h-9 w-9 rounded-lg bg-admin-accent/10 flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-admin-accent" />
              </div>
            </div>
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={callsOverTimeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="calls"
                    name="Total Calls"
                    stroke="hsl(0, 72%, 55%)"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="answered"
                    name="Answered"
                    stroke="hsl(145, 63%, 42%)"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Top Organizations Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="bg-card rounded-xl border border-border/50 p-6 shadow-sm"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-base font-semibold text-foreground">
                  Top Organizations by Call Volume
                </h3>
                <p className="text-sm text-muted-foreground">This month</p>
              </div>
              <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <Building2 className="h-4 w-4 text-primary" />
              </div>
            </div>
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topOrgsData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                  <XAxis
                    type="number"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                    width={80}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar
                    dataKey="calls"
                    name="Calls"
                    fill="hsl(var(--primary))"
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        {/* System Status and Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* System Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            whileHover={{ scale: 1.005 }}
            className="bg-card rounded-xl border border-border/50 p-6 shadow-sm"
          >
            <h3 className="text-base font-semibold text-foreground mb-5">
              System Status
            </h3>
            <div className="space-y-3">
              {[
                { service: "API Gateway", status: "Operational", uptime: "99.99%", latency: "12ms" },
                { service: "Database Cluster", status: "Operational", uptime: "99.95%", latency: "8ms" },
                { service: "AI Processing", status: "Degraded", uptime: "98.50%", latency: "245ms" },
                { service: "Telephony Provider", status: "Operational", uptime: "99.92%", latency: "34ms" },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div>
                    <p className="font-medium text-foreground text-sm">{item.service}</p>
                    <p className="text-xs text-muted-foreground">
                      Uptime: {item.uptime} • Latency: {item.latency}
                    </p>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      item.status === "Operational"
                        ? "bg-emerald-500/10 text-emerald-600"
                        : "bg-amber-500/10 text-amber-600"
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            whileHover={{ scale: 1.005 }}
            className="bg-card rounded-xl border border-border/50 p-6 shadow-sm"
          >
            <h3 className="text-base font-semibold text-foreground mb-5">
              Recent Activity
            </h3>
            <div className="space-y-3">
              {recentActivity.map((item, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="h-8 w-8 rounded-full bg-admin-accent/10 flex items-center justify-center flex-shrink-0">
                    <Activity className="h-4 w-4 text-admin-accent" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-foreground text-sm truncate">
                      {item.action}
                    </p>
                    <p className="text-xs text-muted-foreground">
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
