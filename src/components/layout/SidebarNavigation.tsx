import { NavLink, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Zap,
  LayoutGrid,
  Bot,
  Phone,
  Settings,
  Shield,
  Building,
  CreditCard,
  Users,
  Activity,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface NavItem {
  icon: LucideIcon;
  label: string;
  route: string;
}

const orgNavItems: NavItem[] = [
  { icon: Zap, label: "Dashboard", route: "/app/dashboard" },
  { icon: LayoutGrid, label: "Campaigns", route: "/app/campaigns" },
  { icon: Bot, label: "Agents", route: "/app/agents" },
  { icon: Phone, label: "Calls", route: "/app/calls" },
  { icon: Settings, label: "Settings", route: "/app/settings" },
];

const adminNavItems: NavItem[] = [
  { icon: Building, label: "Organizations", route: "/admin/organizations" },
  { icon: CreditCard, label: "Subscriptions", route: "/admin/subscriptions" },
  { icon: Users, label: "Sessions", route: "/admin/sessions" },
  { icon: Activity, label: "System", route: "/admin/system" },
];

interface SidebarNavigationProps {
  variant: "org" | "admin";
}

export function SidebarNavigation({ variant }: SidebarNavigationProps) {
  const location = useLocation();
  const items = variant === "org" ? orgNavItems : adminNavItems;
  const isAdmin = variant === "admin";

  const isActiveRoute = (route: string) => {
    if (variant === "org") {
      if (route === "/app/dashboard") {
        return location.pathname === "/app" || location.pathname === "/app/dashboard";
      }
    }
    return (
      location.pathname === route ||
      (route !== "/app/dashboard" && location.pathname.startsWith(route))
    );
  };

  return (
    <nav className="flex-1 px-3 py-4">
      <ul className="space-y-1">
        {items.map((item, index) => {
          const isActive = isActiveRoute(item.route);

          return (
            <motion.li
              key={item.route}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
            >
              <NavLink
                to={item.route}
                className={cn(
                  "sidebar-item group relative",
                  isActive &&
                    (isAdmin ? "admin-sidebar-item-active" : "sidebar-item-active")
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId={`sidebar-indicator-${variant}`}
                    className={cn(
                      "absolute left-0 top-0 bottom-0 w-0.5 rounded-full",
                      isAdmin ? "bg-admin-accent" : "bg-primary"
                    )}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
                <item.icon
                  className={cn(
                    "h-5 w-5 transition-colors",
                    isActive
                      ? isAdmin
                        ? "text-admin-accent"
                        : "text-primary"
                      : "text-sidebar-muted group-hover:text-sidebar-foreground"
                  )}
                />
                <span className="text-sm">{item.label}</span>
              </NavLink>
            </motion.li>
          );
        })}
      </ul>
    </nav>
  );
}
