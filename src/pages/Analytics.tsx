import { OrgAppShell } from "@/components/layout/OrgAppShell";
import { PageContainer } from "@/components/layout/PageContainer";
import { StatCard } from "@/components/shared/StatCard";
import { FilterChip, FilterChipGroup } from "@/components/shared/FilterChip";
import { TrendingUp, Users, Mail, MousePointerClick } from "lucide-react";
import { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const chartData = [
  { name: "Mon", sent: 400, opened: 240, clicked: 120 },
  { name: "Tue", sent: 300, opened: 180, clicked: 90 },
  { name: "Wed", sent: 500, opened: 320, clicked: 180 },
  { name: "Thu", sent: 450, opened: 280, clicked: 140 },
  { name: "Fri", sent: 600, opened: 420, clicked: 210 },
  { name: "Sat", sent: 350, opened: 200, clicked: 100 },
  { name: "Sun", sent: 250, opened: 140, clicked: 70 },
];

const Analytics = () => {
  const [period, setPeriod] = useState("7d");

  return (
    <OrgAppShell>
      <PageContainer
        title="Analytics"
        subtitle="Track your campaign performance and engagement metrics"
      >
        {/* Period Selector */}
        <FilterChipGroup className="mb-6">
          {[
            { value: "24h", label: "24 Hours" },
            { value: "7d", label: "7 Days" },
            { value: "30d", label: "30 Days" },
            { value: "90d", label: "90 Days" },
          ].map((p) => (
            <FilterChip
              key={p.value}
              label={p.label}
              isActive={period === p.value}
              onToggle={() => setPeriod(p.value)}
            />
          ))}
        </FilterChipGroup>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="Total Sent"
            value="24,580"
            trend={{ value: 15.2, isPositive: true }}
            icon={Mail}
            iconColor="primary"
          />
          <StatCard
            title="Open Rate"
            value="42.3%"
            trend={{ value: 5.8, isPositive: true }}
            icon={TrendingUp}
            iconColor="success"
          />
          <StatCard
            title="Click Rate"
            value="18.7%"
            trend={{ value: 2.1, isPositive: true }}
            icon={MousePointerClick}
            iconColor="warning"
          />
          <StatCard
            title="New Leads"
            value="1,245"
            trend={{ value: 8.4, isPositive: true }}
            icon={Users}
            iconColor="primary"
          />
        </div>

        {/* Chart */}
        <div className="bg-card rounded-lg shadow-card border border-border/50 p-6">
          <h2 className="text-lg font-semibold text-foreground mb-6">Engagement Overview</h2>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorSent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorOpened" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--success))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--success))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="sent"
                  stroke="hsl(var(--primary))"
                  fillOpacity={1}
                  fill="url(#colorSent)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="opened"
                  stroke="hsl(var(--success))"
                  fillOpacity={1}
                  fill="url(#colorOpened)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </PageContainer>
    </OrgAppShell>
  );
};

export default Analytics;
