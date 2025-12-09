import { motion } from "framer-motion";
import { CheckCircle, AlertTriangle, XCircle, Clock, Zap } from "lucide-react";
import type { ServiceStatus } from "./SystemStatusIndicator";

interface ServiceHealthCardProps {
  name: string;
  status: ServiceStatus;
  lastCheck: string;
  responseTime: string;
  index?: number;
}

const statusConfig = {
  operational: {
    icon: CheckCircle,
    label: "Operational",
    color: "text-success",
    bg: "bg-success/10",
    border: "border-success/20",
  },
  degraded: {
    icon: AlertTriangle,
    label: "Degraded",
    color: "text-warning",
    bg: "bg-warning/10",
    border: "border-warning/20",
  },
  down: {
    icon: XCircle,
    label: "Down",
    color: "text-destructive",
    bg: "bg-destructive/10",
    border: "border-destructive/20",
  },
};

export const ServiceHealthCard = ({
  name,
  status,
  lastCheck,
  responseTime,
  index = 0,
}: ServiceHealthCardProps) => {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`bg-card rounded-lg border ${config.border} p-4 hover:shadow-md transition-shadow`}
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-medium text-foreground">{name}</h3>
        <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full ${config.bg}`}>
          <Icon className={`h-3.5 w-3.5 ${config.color}`} />
          <span className={`text-xs font-medium ${config.color}`}>{config.label}</span>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-3.5 w-3.5" />
          <span>Last check: {lastCheck}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Zap className="h-3.5 w-3.5" />
          <span>Response: {responseTime}</span>
        </div>
      </div>
    </motion.div>
  );
};
