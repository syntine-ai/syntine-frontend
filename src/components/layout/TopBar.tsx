import { motion } from "framer-motion";
import { Bell, Search, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useLocation } from "react-router-dom";

interface TopBarProps {
  workspaceName?: string;
  variant: "org" | "admin";
}

const routeLabels: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/campaigns": "Campaigns",
  "/agents": "Agents",
  "/contacts": "Contacts",
  "/analytics": "Analytics",
  "/settings": "Settings",
  "/admin": "Admin Dashboard",
  "/admin/organizations": "Organizations",
  "/admin/logs": "System Logs",
  "/admin/settings": "Admin Settings",
};

export function TopBar({ workspaceName = "Syntine Workspace", variant }: TopBarProps) {
  const location = useLocation();
  const pathParts = location.pathname.split("/").filter(Boolean);
  
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

      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
          <Search className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-2 right-2 h-2 w-2 bg-primary rounded-full" />
        </Button>
        <div className="h-8 w-px bg-border mx-1" />
        <Avatar className="h-8 w-8 cursor-pointer ring-2 ring-transparent hover:ring-primary/20 transition-all">
          <AvatarImage src="" />
          <AvatarFallback className={variant === "admin" ? "bg-admin-accent text-admin-accent-foreground" : "bg-primary text-primary-foreground"}>
            {variant === "admin" ? "AD" : "JD"}
          </AvatarFallback>
        </Avatar>
      </div>
    </motion.header>
  );
}
