import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useLocation } from "react-router-dom";
import { CommandPalette } from "./CommandPalette";
import { AdminCommandPalette } from "@/components/admin/AdminCommandPalette";
import { NotificationDropdown } from "./NotificationDropdown";
import { UserMenu } from "./UserMenu";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ChannelSwitcher } from "./ChannelSwitcher";

interface TopBarProps {
  workspaceName?: string;
  variant: "org" | "admin";
}

const routeLabels: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/campaigns": "Campaigns",
  "/agents": "Agents",
  "/calls": "Call Analytics",
  "/settings": "Settings",
  "/account": "Account",
  "/admin/dashboard": "Dashboard",
  "/admin/organizations": "Organizations",
  "/admin/subscriptions": "Subscriptions",
  "/admin/sessions": "Sessions",
  "/admin/system": "System Health",
  "/admin/activity": "Activity Logs",
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
      {variant === "admin" ? (
        <AdminCommandPalette open={commandOpen} onOpenChange={setCommandOpen} />
      ) : (
        <CommandPalette variant={variant} />
      )}
      <header
        className="h-16 border-b border-border bg-background flex items-center justify-between px-5"
      >
        <div className="flex items-center gap-2">
          {variant === "org" && <ChannelSwitcher />}
        </div>

        <div className="flex items-center gap-2">


          <ThemeToggle />

          <NotificationDropdown variant={variant} />

          <div className="h-8 w-px bg-border mx-1" />

          <UserMenu variant={variant} />
        </div>
      </header>
    </>
  );
}
