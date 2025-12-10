import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "react-router-dom";
import { CommandPalette } from "./CommandPalette";
import { NotificationDropdown } from "./NotificationDropdown";
import { UserMenu } from "./UserMenu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface TopBarProps {
  workspaceName?: string;
  variant: "org" | "admin";
}

const routeLabels: Record<string, string> = {
  "/app/dashboard": "Dashboard",
  "/app/campaigns": "Campaigns",
  "/app/agents": "Agents",
  "/app/calls": "Call Analytics",
  "/app/settings": "Settings",
  "/app/account": "Account",
  "/admin/organizations": "Organizations",
  "/admin/subscriptions": "Subscriptions",
  "/admin/sessions": "Sessions",
  "/admin/system": "System Health",
  "/admin/profile": "Profile",
  "/admin/settings": "Settings",
};

export function TopBar({ workspaceName = "Syntine Workspace", variant }: TopBarProps) {
  const location = useLocation();
  const [commandOpen, setCommandOpen] = useState(false);
  const pathParts = location.pathname.split("/").filter(Boolean);

  // Keyboard shortcut for command palette
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setCommandOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);
  
  const getBreadcrumbs = () => {
    const crumbs: { label: string; path: string }[] = [];
    let currentPath = "";
    
    pathParts.forEach((part) => {
      currentPath += `/${part}`;
      const label = routeLabels[currentPath] || part.charAt(0).toUpperCase() + part.slice(1);
      crumbs.push({ label, path: currentPath });
    });
    
    return crumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <>
      <CommandPalette variant={variant} />
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="h-16 border-b border-border bg-card/50 backdrop-blur-sm flex items-center justify-between px-6"
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">{workspaceName}</span>
          {breadcrumbs.map((crumb, index) => (
            <div key={crumb.path} className="flex items-center gap-2">
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
              <span
                className={
                  index === breadcrumbs.length - 1
                    ? "text-sm font-medium text-foreground"
                    : "text-sm text-muted-foreground"
                }
              >
                {crumb.label}
              </span>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-foreground"
                onClick={() => setCommandOpen(true)}
              >
                <Search className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Search <kbd className="ml-1 px-1.5 py-0.5 text-xs bg-muted rounded">⌘K</kbd></p>
            </TooltipContent>
          </Tooltip>
          
          <NotificationDropdown variant={variant} />
          
          <div className="h-8 w-px bg-border mx-1" />
          
          <UserMenu variant={variant} />
        </div>
      </motion.header>
    </>
  );
}
