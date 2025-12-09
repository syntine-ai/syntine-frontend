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

interface OrgUsageChartProps {
  data?: { date: string; calls: number }[];
  delay?: number;
}

const defaultData = [
  { date: "Jan 1", calls: 120 },
  { date: "Jan 5", calls: 280 },
  { date: "Jan 10", calls: 340 },
  { date: "Jan 15", calls: 520 },
  { date: "Jan 20", calls: 450 },
  { date: "Jan 25", calls: 680 },
  { date: "Jan 30", calls: 720 },
];

export const OrgUsageChart = ({ data = defaultData, delay = 0 }: OrgUsageChartProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      className="h-[200px] w-full"
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorCalls" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(0, 72%, 55%)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="hsl(0, 72%, 55%)" stopOpacity={0} />
            </linearGradient>
          </defs>
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
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            }}
            labelStyle={{ color: "hsl(var(--foreground))", fontWeight: 500 }}
            itemStyle={{ color: "hsl(var(--admin-accent))" }}
          />
          <Area
            type="monotone"
            dataKey="calls"
            stroke="hsl(0, 72%, 55%)"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorCalls)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  );
};
