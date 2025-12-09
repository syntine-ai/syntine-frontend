import { motion } from "framer-motion";
import { CheckCircle, AlertTriangle, XCircle, Activity } from "lucide-react";

export type ServiceStatus = "operational" | "degraded" | "down";

interface SystemStatusIndicatorProps {
  status?: ServiceStatus;
  showLabel?: boolean;
  compact?: boolean;
}

const statusConfig = {
  operational: {
    icon: CheckCircle,
    label: "All Systems Operational",
    color: "text-success",
    bg: "bg-success/10",
    pulse: false,
  },
  degraded: {
    icon: AlertTriangle,
    label: "Partial System Degradation",
    color: "text-warning",
    bg: "bg-warning/10",
    pulse: true,
  },
  down: {
    icon: XCircle,
    label: "System Outage Detected",
    color: "text-destructive",
    bg: "bg-destructive/10",
    pulse: true,
  },
};

export const SystemStatusIndicator = ({
  status = "operational",
  showLabel = true,
  compact = false,
}: SystemStatusIndicatorProps) => {
  const config = statusConfig[status];
  const Icon = config.icon;

  if (compact) {
    return (
      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${config.bg}`}>
        <motion.div
          animate={config.pulse ? { scale: [1, 1.2, 1] } : {}}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <Icon className={`h-3.5 w-3.5 ${config.color}`} />
        </motion.div>
        {showLabel && (
          <span className={`text-xs font-medium ${config.color}`}>
            {status === "operational" ? "Operational" : status === "degraded" ? "Degraded" : "Outage"}
          </span>
        )}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg ${config.bg} border border-border/50`}
    >
      <motion.div
        animate={config.pulse ? { scale: [1, 1.15, 1] } : {}}
        transition={{ repeat: Infinity, duration: 2 }}
      >
        <Icon className={`h-5 w-5 ${config.color}`} />
      </motion.div>
      <div className="flex items-center gap-2">
        <Activity className="h-4 w-4 text-muted-foreground" />
        <span className={`text-sm font-medium ${config.color}`}>{config.label}</span>
      </div>
    </motion.div>
  );
};
