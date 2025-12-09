import { motion } from "framer-motion";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";

interface AdminMetricCardProps {
  title: string;
  value: string;
  trend?: string;
  icon: LucideIcon;
  delay?: number;
}

export const AdminMetricCard = ({
  title,
  value,
  trend,
  icon: Icon,
  delay = 0,
}: AdminMetricCardProps) => {
  const isPositive = trend?.startsWith("+") || trend?.startsWith("-") && trend?.includes("Error");
  const isNegative = trend?.startsWith("-") && !trend?.includes("Error");
  const showPositiveTrend = trend?.startsWith("+") || (trend?.startsWith("-") && title.toLowerCase().includes("error"));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      whileHover={{ scale: 1.02, y: -2 }}
      className="bg-card rounded-xl border border-border/50 p-5 shadow-sm hover:shadow-md transition-all"
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold text-foreground tracking-tight">{value}</p>
          {trend && (
            <div className="flex items-center gap-1">
              {showPositiveTrend ? (
                <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
              ) : (
                <TrendingDown className="h-3.5 w-3.5 text-emerald-500" />
              )}
              <span className="text-xs font-medium text-emerald-500">
                {trend}
              </span>
              <span className="text-xs text-muted-foreground">vs last period</span>
            </div>
          )}
        </div>
        <div className="h-11 w-11 rounded-xl bg-admin-accent/10 flex items-center justify-center">
          <Icon className="h-5 w-5 text-admin-accent" />
        </div>
      </div>
    </motion.div>
  );
};
