import { NavLink, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Zap,
  LayoutGrid,
  Bot,
  Phone,
  PhoneCall,
  Link2,
  ShoppingCart,
  Package,
  MessageCircle,
  FileText,
  BarChart3,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useSidebar } from "@/contexts/SidebarContext";
import { useChannel } from "@/contexts/ChannelContext";
import { ChannelSwitcher } from "./ChannelSwitcher";

interface NavItem {
  icon: LucideIcon;
  label: string;
  route: string;
}

const voiceNavItems: NavItem[] = [
  { icon: Zap, label: "Dashboard", route: "/dashboard" },
  { icon: LayoutGrid, label: "Campaigns", route: "/campaigns" },
  { icon: Bot, label: "Agents", route: "/agents" },
  { icon: PhoneCall, label: "Phone Numbers", route: "/phone-numbers" },
  { icon: Phone, label: "Call Logs", route: "/calls" },
  { icon: Package, label: "Products", route: "/products" },
  { icon: ShoppingCart, label: "Orders", route: "/orders" },
  { icon: Link2, label: "Integrations", route: "/integrations" },
];

const chatNavItems: NavItem[] = [
  { icon: BarChart3, label: "Dashboard", route: "/chat/dashboard" },
  { icon: Bot, label: "Agent Config", route: "/chat/agent" },
  { icon: Zap, label: "Automations", route: "/chat/automations" },
  { icon: MessageCircle, label: "Conversations", route: "/chat/conversations" },
  { icon: FileText, label: "Templates", route: "/chat/templates" },
  { icon: Package, label: "Products", route: "/products" },
  { icon: ShoppingCart, label: "Orders", route: "/orders" },
  { icon: Link2, label: "Integrations", route: "/integrations" },
];

interface SidebarNavigationProps {
  isCollapsed?: boolean;
}

export function SidebarNavigation({ isCollapsed: propCollapsed }: SidebarNavigationProps) {
  const location = useLocation();
  const context = useSidebar();
  const { activeChannel } = useChannel();
  const isCollapsed = propCollapsed ?? context.isCollapsed;
  const items = activeChannel === "chat" ? chatNavItems : voiceNavItems;
  const isChat = activeChannel === "chat";

  const isActiveRoute = (route: string) => {
    if (route === "/dashboard") {
      return location.pathname === "/" || location.pathname === "/dashboard";
    }
    if (route === "/chat/dashboard") {
      return location.pathname === "/chat/dashboard";
    }
    return (
      location.pathname === route ||
      (!["/dashboard", "/chat/dashboard"].includes(route) && location.pathname.startsWith(route))
    );
  };

  return (
    <nav className="flex-1 px-3 py-4">
      <ul className="space-y-1">
        {items.map((item) => {
          const isActive = isActiveRoute(item.route);

          const linkContent = (
            <NavLink
              to={item.route}
              className={cn(
                "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all duration-200",
                isCollapsed && "justify-center px-2",
                isActive
                  ? isChat
                    ? "bg-[hsl(142,71%,45%)]/10 text-[hsl(142,71%,45%)]"
                    : "bg-primary/10 text-primary"
                  : "text-sidebar-muted hover:bg-sidebar-accent hover:text-sidebar-foreground"
              )}
            >
              {isActive && (
                <div
                  className={cn(
                    "absolute left-0 top-0 bottom-0 w-0.5 rounded-full",
                    isChat ? "bg-[hsl(142,71%,45%)]" : "bg-primary"
                  )}
                />
              )}
              <item.icon
                className={cn(
                  "h-5 w-5 shrink-0 transition-colors",
                  isActive
                    ? isChat ? "text-[hsl(142,71%,45%)]" : "text-primary"
                    : "text-icon group-hover:text-sidebar-foreground"
                )}
              />
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
            <li key={item.route}>
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
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
