import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Check, Info, AlertTriangle, CheckCircle2, XCircle, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface Notification {
  id: number;
  title: string;
  description: string;
  time: string;
  read: boolean;
  type: "info" | "warning" | "success" | "error";
}

interface NotificationDropdownProps {
  variant: "org" | "admin";
}

const orgNotifications: Notification[] = [
  {
    id: 1,
    title: "Campaign completed",
    description: "Summer Outreach finished with 89% success rate",
    time: "2m ago",
    read: false,
    type: "success",
  },
  {
    id: 2,
    title: "Agent offline",
    description: "Sales Bot Pro went offline unexpectedly",
    time: "15m ago",
    read: false,
    type: "warning",
  },
  {
    id: 3,
    title: "New leads imported",
    description: "248 contacts added to your caller list",
    time: "1h ago",
    read: false,
    type: "info",
  },
  {
    id: 4,
    title: "Weekly report ready",
    description: "Your call analytics report is available",
    time: "3h ago",
    read: true,
    type: "info",
  },
];

const adminNotifications: Notification[] = [
  {
    id: 1,
    title: "New organization signup",
    description: "TechCorp Inc just created an account",
    time: "5m ago",
    read: false,
    type: "success",
  },
  {
    id: 2,
    title: "High API error rate",
    description: "Error rate exceeded 5% threshold",
    time: "12m ago",
    read: false,
    type: "error",
  },
  {
    id: 3,
    title: "Subscription upgraded",
    description: "Acme Corp upgraded to Enterprise plan",
    time: "45m ago",
    read: false,
    type: "info",
  },
  {
    id: 4,
    title: "System maintenance",
    description: "Scheduled maintenance completed successfully",
    time: "2h ago",
    read: true,
    type: "success",
  },
];

const typeIcons = {
  info: Info,
  warning: AlertTriangle,
  success: CheckCircle2,
  error: XCircle,
};

const typeColors = {
  info: "text-blue-500",
  warning: "text-warning",
  success: "text-success",
  error: "text-destructive",
};

export function NotificationDropdown({ variant }: NotificationDropdownProps) {
  const navigate = useNavigate();
  const initialNotifications = variant === "org" ? orgNotifications : adminNotifications;
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  
  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const markAsRead = (id: number) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const viewAll = () => {
    navigate(variant === "org" ? "/app/notifications" : "/admin/notifications");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-foreground relative"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-destructive rounded-full animate-pulse" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 bg-popover border-border">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
              onClick={markAllAsRead}
            >
              <Check className="h-3 w-3 mr-1" />
              Mark all read
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <ScrollArea className="h-[300px]">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground text-sm">
              No notifications
            </div>
          ) : (
            notifications.map((notification) => {
              const Icon = typeIcons[notification.type];
              return (
                <DropdownMenuItem
                  key={notification.id}
                  className={cn(
                    "flex items-start gap-3 p-3 cursor-pointer focus:bg-accent",
                    !notification.read && "bg-accent/50"
                  )}
                  onClick={() => markAsRead(notification.id)}
                >
                  <Icon className={cn("h-5 w-5 mt-0.5 shrink-0", typeColors[notification.type])} />
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      "text-sm truncate",
                      !notification.read ? "font-medium" : "text-muted-foreground"
                    )}>
                      {notification.title}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {notification.description}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {notification.time}
                    </p>
                  </div>
                  {!notification.read && (
                    <span className="h-2 w-2 bg-primary rounded-full shrink-0 mt-1.5" />
                  )}
                </DropdownMenuItem>
              );
            })
          )}
        </ScrollArea>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="justify-center text-sm text-primary cursor-pointer"
          onClick={viewAll}
        >
          View all notifications
          <ExternalLink className="h-3 w-3 ml-1" />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
