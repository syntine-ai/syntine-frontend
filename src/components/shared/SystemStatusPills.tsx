import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Database, Bot, Phone, Wifi, AlertTriangle } from "lucide-react";

type StatusState = "online" | "degraded" | "offline";

interface SystemStatus {
  database: StatusState;
  agent: StatusState;
  telephony: StatusState;
}

const statusConfig: Record<StatusState, { label: string; className: string }> = {
  online: { label: "Online", className: "bg-success/15 text-success" },
  degraded: { label: "Degraded", className: "bg-warning/15 text-warning" },
  offline: { label: "Offline", className: "bg-destructive/15 text-destructive" },
};

interface SystemStatusPillsProps {
  status?: SystemStatus;
  compact?: boolean;
  className?: string;
}

export function SystemStatusPills({ 
  status = { database: "online", agent: "online", telephony: "online" },
  compact = false,
  className 
}: SystemStatusPillsProps) {
  const items = [
    { key: "database", label: "DB", icon: Database, state: status.database },
    { key: "agent", label: "Agent", icon: Bot, state: status.agent },
    { key: "telephony", label: "Telephony", icon: Phone, state: status.telephony },
  ];

  if (compact) {
    return (
      <div className={cn("flex items-center gap-1.5", className)}>
        {items.map((item) => (
          <motion.div
            key={item.key}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={cn(
              "flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium",
              statusConfig[item.state].className
            )}
          >
            <item.icon className="h-3 w-3" />
            <span>{item.label}</span>
          </motion.div>
        ))}
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-3", className)}>
      {items.map((item, index) => (
        <motion.div
          key={item.key}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          className="flex items-center gap-2"
        >
          <div className={cn(
            "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
            statusConfig[item.state].className
          )}>
            <item.icon className="h-3.5 w-3.5" />
            <span>{item.label}</span>
            <span className="opacity-70">•</span>
            <span>{statusConfig[item.state].label}</span>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// Simple inline status for table rows
interface InlineStatusProps {
  dbStatus: "ok" | "error" | "syncing";
  agentStatus: "online" | "offline" | "busy";
}

const dbConfig = {
  ok: { label: "DB OK", className: "bg-success/15 text-success" },
  error: { label: "DB Error", className: "bg-destructive/15 text-destructive" },
  syncing: { label: "Syncing", className: "bg-warning/15 text-warning" },
};

const agentConfig = {
  online: { label: "Online", className: "bg-success/15 text-success" },
  offline: { label: "Offline", className: "bg-muted text-muted-foreground" },
  busy: { label: "Busy", className: "bg-warning/15 text-warning" },
};

export function InlineSystemStatus({ dbStatus, agentStatus }: InlineStatusProps) {
  return (
    <div className="flex items-center gap-1.5">
      <span className={cn(
        "px-1.5 py-0.5 rounded text-[10px] font-medium",
        dbConfig[dbStatus].className
      )}>
        {dbConfig[dbStatus].label}
      </span>
      <span className={cn(
        "px-1.5 py-0.5 rounded text-[10px] font-medium",
        agentConfig[agentStatus].className
      )}>
        {agentConfig[agentStatus].label}
      </span>
    </div>
  );
}
