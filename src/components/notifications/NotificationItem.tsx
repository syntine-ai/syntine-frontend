import { motion } from "framer-motion";
import { Info, AlertTriangle, CheckCircle2, XCircle, Bell } from "lucide-react";
import { cn } from "@/lib/utils";

export interface NotificationData {
  id: number;
  title: string;
  message: string;
  type: "info" | "warning" | "success" | "error";
  time: string;
  read: boolean;
}

interface NotificationItemProps {
  notification: NotificationData;
  onMarkAsRead: (id: number) => void;
}

const typeConfig = {
  info: {
    icon: Info,
    color: "text-primary",
    bg: "bg-primary/10",
  },
  warning: {
    icon: AlertTriangle,
    color: "text-warning",
    bg: "bg-warning/10",
  },
  success: {
    icon: CheckCircle2,
    color: "text-success",
    bg: "bg-success/10",
  },
  error: {
    icon: XCircle,
    color: "text-destructive",
    bg: "bg-destructive/10",
  },
};

export function NotificationItem({ notification, onMarkAsRead }: NotificationItemProps) {
  const { icon: Icon, color, bg } = typeConfig[notification.type];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={cn(
        "flex items-start gap-4 p-4 rounded-lg border cursor-pointer transition-colors hover:bg-muted/30",
        notification.read ? "bg-card border-border" : "bg-muted/20 border-primary/20"
      )}
      onClick={() => onMarkAsRead(notification.id)}
    >
      <div className={cn("p-2 rounded-lg shrink-0", bg)}>
        <Icon className={cn("h-[18px] w-[18px]", color)} />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h4 className={cn(
            "text-sm truncate",
            notification.read ? "text-muted-foreground" : "font-medium text-foreground"
          )}>
            {notification.title}
          </h4>
          {!notification.read && (
            <span className="h-2 w-2 bg-primary rounded-full shrink-0 mt-1.5" />
          )}
        </div>
        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
          {notification.message}
        </p>
        <p className="text-xs text-muted-foreground mt-2">
          {notification.time}
        </p>
      </div>
    </motion.div>
  );
}
