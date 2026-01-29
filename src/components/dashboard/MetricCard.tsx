import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface MetricCardProps {
  label: string;
  value: string;
  caption?: string;
  trend?: number;
  trendDirection?: "up" | "down" | "neutral";
  icon?: LucideIcon;
  variant?: "primary" | "secondary" | "default";
  className?: string;
}

export function MetricCard({
  label,
  value,
  caption,
  trend,
  trendDirection,
  icon: Icon,
  variant = "default",
  className,
}: MetricCardProps) {
  const isPositive = trendDirection === "up" || (trend !== undefined && trend > 0);
  const isNegative = trendDirection === "down" || (trend !== undefined && trend < 0);
  const isNeutral = trendDirection === "neutral" || trend === 0;

  const TrendIcon = isPositive ? TrendingUp : isNegative ? TrendingDown : Minus;

  const isSecondary = variant === "secondary";
  const isPrimary = variant === "primary";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -2 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "relative group overflow-hidden rounded-lg",
        isSecondary ? "p-4" : "p-5",
        "bg-card border border-border",
        "transition-colors hover:bg-muted/30",
        isPrimary && "border-primary/30 bg-primary/5",
        className
      )}
    >
      {/* Subtle accent glow on hover */}
      <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-2">
          <span className={cn(
            "font-medium text-muted-foreground",
            isSecondary ? "text-xs" : "text-sm"
          )}>
            {label}
          </span>
          {Icon && (
            <div className={cn(
              "rounded-lg",
              isSecondary ? "p-1.5 bg-muted" : "p-2 bg-primary/10"
            )}>
              <Icon className={cn(
                isSecondary 
                  ? "h-4 w-4 text-muted-foreground" 
                  : "h-[18px] w-[18px] text-primary"
              )} />
            </div>
          )}
        </div>

        <div className="flex items-end justify-between gap-3">
          <div className="flex flex-col">
            <span className={cn(
              "font-semibold text-foreground tracking-tight",
              isSecondary ? "text-xl" : "text-3xl"
            )}>
              {value}
            </span>
            {caption && (
              <span className="text-xs text-muted-foreground mt-1">
                {caption}
              </span>
            )}
          </div>

          {trend !== undefined && (
            <div
              className={cn(
                "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
                isPositive && "bg-success/15 text-success",
                isNegative && "bg-destructive/15 text-destructive",
                isNeutral && "bg-muted text-muted-foreground"
              )}
            >
              <TrendIcon className="h-3 w-3" />
              <span>{Math.abs(trend)}%</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
