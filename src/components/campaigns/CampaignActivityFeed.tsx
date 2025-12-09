import { motion } from "framer-motion";
import { Activity, Phone, AlertTriangle, CheckCircle, Pause, Play } from "lucide-react";
import { cn } from "@/lib/utils";

interface ActivityItem {
  id: number;
  type: "call" | "status" | "alert" | "success";
  message: string;
  timestamp: string;
}

const mockActivities: ActivityItem[] = [
  { id: 1, type: "call", message: "Call completed to +1 555-0123", timestamp: "2 min ago" },
  { id: 2, type: "success", message: "Campaign reached 100 calls milestone", timestamp: "15 min ago" },
  { id: 3, type: "status", message: "Campaign resumed by Admin", timestamp: "1 hour ago" },
  { id: 4, type: "alert", message: "High failure rate detected (>20%)", timestamp: "2 hours ago" },
  { id: 5, type: "status", message: "Campaign paused for review", timestamp: "2 hours ago" },
  { id: 6, type: "call", message: "Call completed to +1 555-0456", timestamp: "3 hours ago" },
  { id: 7, type: "success", message: "Agent prompt updated successfully", timestamp: "4 hours ago" },
];

const typeConfig = {
  call: { icon: Phone, color: "text-primary", bg: "bg-primary/10" },
  status: { icon: Pause, color: "text-warning", bg: "bg-warning/10" },
  alert: { icon: AlertTriangle, color: "text-destructive", bg: "bg-destructive/10" },
  success: { icon: CheckCircle, color: "text-success", bg: "bg-success/10" },
};

export function CampaignActivityFeed() {
  return (
    <div className="space-y-3">
      {mockActivities.map((activity, i) => {
        const config = typeConfig[activity.type];
        const Icon = config.icon;

        return (
          <motion.div
            key={activity.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
          >
            <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0", config.bg)}>
              <Icon className={cn("h-4 w-4", config.color)} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-foreground">{activity.message}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{activity.timestamp}</p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
