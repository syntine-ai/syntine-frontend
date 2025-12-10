import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { NotificationItem, NotificationData } from "./NotificationItem";
import { Button } from "@/components/ui/button";
import { Check, Bell, Filter } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NotificationListProps {
  notifications: NotificationData[];
  variant: "org" | "admin";
}

type FilterType = "all" | "unread" | "info" | "warning" | "success" | "error";

export function NotificationList({ notifications: initialNotifications, variant }: NotificationListProps) {
  const [notifications, setNotifications] = useState<NotificationData[]>(initialNotifications);
  const [filter, setFilter] = useState<FilterType>("all");

  const markAsRead = (id: number) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filteredNotifications = notifications.filter((n) => {
    if (filter === "all") return true;
    if (filter === "unread") return !n.read;
    return n.type === filter;
  });

  const filterLabels: Record<FilterType, string> = {
    all: "All",
    unread: "Unread",
    info: "Info",
    warning: "Warnings",
    success: "Success",
    error: "Errors",
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                {filterLabels[filter]}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {(Object.keys(filterLabels) as FilterType[]).map((key) => (
                <DropdownMenuItem
                  key={key}
                  onClick={() => setFilter(key)}
                  className={filter === key ? "bg-accent" : ""}
                >
                  {filterLabels[key]}
                  {key === "unread" && unreadCount > 0 && (
                    <span className="ml-auto text-xs text-muted-foreground">
                      {unreadCount}
                    </span>
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          
          {unreadCount > 0 && (
            <span className="text-sm text-muted-foreground">
              {unreadCount} unread
            </span>
          )}
        </div>

        {unreadCount > 0 && (
          <Button variant="ghost" size="sm" onClick={markAllAsRead}>
            <Check className="h-4 w-4 mr-2" />
            Mark all as read
          </Button>
        )}
      </div>

      {/* Notification List */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onMarkAsRead={markAsRead}
              />
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <EmptyState
                icon={Bell}
                title="No notifications"
                description={
                  filter === "all"
                    ? "You're all caught up! No notifications to display."
                    : `No ${filterLabels[filter].toLowerCase()} notifications.`
                }
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
