import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useQuery } from "@tanstack/react-query";
import { getCallAnalytics } from "@/api/services/analytics.service";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

export function OutcomePerformanceChart() {
  const { profile } = useAuth();

  const { data: analyticsData, isLoading } = useQuery({
    queryKey: ["call-analytics", profile?.organization_id],
    queryFn: () => getCallAnalytics(profile?.organization_id!, { period: 'last_30_days', group_by: 'day' }),
    enabled: !!profile?.organization_id,
  });

  const chartData = analyticsData?.data?.map(item => ({
    date: new Date(item.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    ordersConfirmed: item.answered // Mapping 'answered' to 'ordersConfirmed' for this chart context
  })) || [];

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-lg border border-border p-6 h-[400px] flex items-center justify-center"
      >
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground mr-2" />
        <span className="text-muted-foreground">Loading chart data...</span>
      </motion.div>
    );
  }

  if (chartData.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-lg border border-border p-6 h-[400px] flex flex-col items-center justify-center"
      >
        <h2 className="text-lg font-semibold text-foreground mb-2">Outcomes Over Time</h2>
        <p className="text-muted-foreground">No data available for the selected period.</p>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-card rounded-lg border border-border p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            Outcomes Over Time
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Orders confirmed per day (Answered Calls)
          </p>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 mb-6">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-success" />
          <span className="text-sm text-muted-foreground">Orders Confirmed</span>
        </div>
      </div>

      <div className="h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="gradientOrders" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--success))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--success))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsl(var(--border))"
              vertical={false}
            />
            <XAxis
              dataKey="date"
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "12px",
                fontSize: "12px",
              }}
              labelStyle={{ color: "hsl(var(--foreground))", fontWeight: 600 }}
            />
            <Area
              type="monotone"
              dataKey="ordersConfirmed"
              stroke="hsl(var(--success))"
              strokeWidth={2}
              fill="url(#gradientOrders)"
              name="Orders Confirmed"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
