import { NavLink, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Zap,
  LayoutGrid,
  Bot,
  Phone,
  Settings,
  Building,
  CreditCard,
  Users,
  Activity,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useSidebar } from "@/contexts/SidebarContext";

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
  const { isCollapsed } = useSidebar();
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

          const linkContent = (
            <NavLink
              to={item.route}
              className={cn(
                "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all duration-200",
                isCollapsed && "justify-center px-2",
                isActive
                  ? isAdmin
                    ? "bg-admin-accent/10 text-admin-accent"
                    : "bg-primary/10 text-primary"
                  : "text-sidebar-muted hover:bg-sidebar-accent hover:text-sidebar-foreground"
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
              <motion.div
                animate={{ scale: isCollapsed ? 1.1 : 1 }}
                transition={{ duration: 0.2 }}
              >
                <item.icon
                  className={cn(
                    "h-5 w-5 shrink-0 transition-colors",
                    isActive
                      ? isAdmin
                        ? "text-admin-accent"
                        : "text-primary"
                      : "text-sidebar-muted group-hover:text-sidebar-foreground"
                  )}
                />
              </motion.div>
              <AnimatePresence mode="wait">
                {!isCollapsed && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                    className="text-sm font-medium whitespace-nowrap overflow-hidden"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </NavLink>
          );

          return (
            <motion.li
              key={item.route}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
            >
              {isCollapsed ? (
                <Tooltip delayDuration={0}>
                  <TooltipTrigger asChild>
                    {linkContent}
                  </TooltipTrigger>
                  <TooltipContent side="right" className="font-medium">
                    {item.label}
                  </TooltipContent>
                </Tooltip>
              ) : (
                linkContent
              )}
            </motion.li>
          );
        })}
      </ul>
    </nav>
  );
}
