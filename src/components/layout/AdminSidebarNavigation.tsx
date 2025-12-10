import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Building2,
  Cpu,
  CreditCard,
  Server,
  ListOrdered,
  ChevronDown,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useSidebar } from "@/contexts/SidebarContext";

interface NavItem {
  icon: LucideIcon;
  label: string;
  route: string;
}

interface NavGroup {
  label: string;
  collapsible?: boolean;
  items: NavItem[];
}

const adminNavGroups: NavGroup[] = [
  {
    label: "Overview",
    items: [
      { icon: LayoutDashboard, label: "Dashboard", route: "/admin/dashboard" },
    ],
  },
  {
    label: "Organizations",
    items: [
      { icon: Building2, label: "Organization List", route: "/admin/organizations" },
      { icon: Cpu, label: "Sessions", route: "/admin/sessions" },
    ],
  },
  {
    label: "Billing",
    items: [
      { icon: CreditCard, label: "Subscriptions", route: "/admin/subscriptions" },
    ],
  },
  {
    label: "System",
    collapsible: true,
    items: [
      { icon: Server, label: "System Status", route: "/admin/system" },
      { icon: ListOrdered, label: "Activity Logs", route: "/admin/activity" },
    ],
  },
];

export function AdminSidebarNavigation() {
  const location = useLocation();
  const { isCollapsed } = useSidebar();
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

  const isActiveRoute = (route: string) => {
    return location.pathname === route || location.pathname.startsWith(route + "/");
  };

  const isGroupActive = (group: NavGroup) => {
    return group.items.some((item) => isActiveRoute(item.route));
  };

  const toggleGroup = (label: string) => {
    setCollapsedGroups((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  };

  return (
    <nav className="flex-1 px-3 py-4 overflow-y-auto">
      <div className="space-y-6">
        {adminNavGroups.map((group, groupIndex) => {
          const isExpanded = !collapsedGroups[group.label];
          const groupActive = isGroupActive(group);

          return (
            <motion.div
              key={group.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: groupIndex * 0.05, duration: 0.25 }}
            >
              {/* Group Header */}
              {!isCollapsed && (
                <div
                  className={cn(
                    "flex items-center justify-between px-3 mb-2",
                    group.collapsible && "cursor-pointer"
                  )}
                  onClick={() => group.collapsible && toggleGroup(group.label)}
                >
                  <span className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">
                    {group.label}
                  </span>
                  {group.collapsible && (
                    <motion.div
                      animate={{ rotate: isExpanded ? 0 : -90 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                    </motion.div>
                  )}
                </div>
              )}

              {/* Group Items */}
              <AnimatePresence initial={false}>
                {(isExpanded || isCollapsed) && (
                  <motion.ul
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                    className="space-y-1 overflow-hidden"
                  >
                    {group.items.map((item, index) => {
                      const isActive = isActiveRoute(item.route);

                      const linkContent = (
                        <NavLink
                          to={item.route}
                          className={cn(
                            "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all duration-200",
                            isCollapsed && "justify-center px-2",
                            isActive
                              ? "bg-primary/15 text-primary"
                              : "text-sidebar-muted hover:bg-sidebar-accent hover:text-sidebar-foreground"
                          )}
                        >
                          {isActive && (
                            <motion.div
                              layoutId="admin-sidebar-indicator"
                              className="absolute left-0 top-0 bottom-0 w-0.5 rounded-full bg-primary"
                              transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            />
                          )}
                          <motion.div
                            animate={{ scale: isCollapsed ? 1.05 : 1 }}
                            transition={{ duration: 0.2 }}
                          >
                            <item.icon
                              className={cn(
                                "h-5 w-5 shrink-0 transition-colors",
                                isActive
                                  ? "text-primary"
                                  : "text-icon group-hover:text-sidebar-foreground"
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
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.03, duration: 0.2 }}
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
                  </motion.ul>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </nav>
  );
}
