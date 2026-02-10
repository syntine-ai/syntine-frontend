import { ReactNode, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SidebarNavigation } from "./SidebarNavigation";
import { TopBar } from "./TopBar";
import { Zap, Menu, PanelLeftClose, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSidebar, SidebarProvider } from "@/contexts/SidebarContext";
import { ChannelProvider } from "@/contexts/ChannelContext";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface OrgAppShellProps {
  children: ReactNode;
}

function OrgAppShellContent({ children }: OrgAppShellProps) {
  // Force sidebar to be always collapsed as per user request
  const isCollapsed = true;
  const { organization, isLoading } = useAuth();

  // Get initials from organization name
  const orgInitials = useMemo(() => {
    if (!organization?.name) return "??";
    const words = organization.name.trim().split(/\s+/);
    if (words.length === 1) {
      return words[0].substring(0, 2).toUpperCase();
    }
    return (words[0][0] + words[1][0]).toUpperCase();
  }, [organization?.name]);

  // Format plan name for display
  const planDisplay = useMemo(() => {
    if (!organization?.plan) return null;
    return organization.plan.charAt(0).toUpperCase() + organization.plan.slice(1) + " Plan";
  }, [organization?.plan]);

  return (
    <div className="min-h-screen flex w-full">
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: 72 }}
        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
        className="bg-sidebar flex flex-col fixed h-screen z-40 overflow-hidden"
      >
        {/* Header */}
        <div className="h-16 flex items-center justify-center px-3 border-b border-sidebar-border">
          <motion.div
            className="flex items-center gap-3 overflow-hidden"
            animate={{ justifyContent: "center" }}
          >
            <img
              src="/logo.png"
              alt="Syntine"
              className="h-8 w-8 rounded-lg shrink-0"
            />
          </motion.div>
        </div>

        {/* Navigation */}
        <SidebarNavigation isCollapsed={true} />

        {/* Footer - Organization Info */}
        <div className="p-3 border-t border-sidebar-border">
          <motion.div
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg",
              isCollapsed && "justify-center px-0"
            )}
          >
            {isLoading ? (
              <>
                <Skeleton className="h-8 w-8 rounded-full shrink-0" />
                {!isCollapsed && (
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                )}
              </>
            ) : organization ? (
              <>
                <div className="h-8 w-8 rounded-full bg-sidebar-accent flex items-center justify-center shrink-0">
                  <span className="text-xs font-medium text-sidebar-foreground">{orgInitials}</span>
                </div>
                <AnimatePresence mode="wait">
                  {!isCollapsed && (
                    <motion.div
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.2 }}
                      className="flex-1 min-w-0 overflow-hidden"
                    >
                      <p className="text-sm font-medium text-sidebar-foreground truncate">
                        {organization.name}
                      </p>
                      {planDisplay && (
                        <p className="text-xs text-sidebar-muted truncate">{planDisplay}</p>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            ) : (
              <>
                <div className="h-8 w-8 rounded-full bg-sidebar-accent/50 flex items-center justify-center shrink-0">
                  <Building2 className="h-4 w-4 text-sidebar-muted" />
                </div>
                <AnimatePresence mode="wait">
                  {!isCollapsed && (
                    <motion.div
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.2 }}
                      className="flex-1 min-w-0 overflow-hidden"
                    >
                      <p className="text-sm font-medium text-sidebar-muted truncate">
                        No Organization
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            )}
          </motion.div>
        </div>
      </motion.aside>

      {/* Main content area - static margin since sidebar is fixed */}
      <div className="flex-1 flex flex-col min-h-screen ml-[72px]">
        {/* Sticky Header */}
        <div className="sticky top-0 z-30 bg-background">
          <TopBar workspaceName={organization?.name || "Organization"} variant="org" />
        </div>
        <main className="bg-background flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}

export function OrgAppShell({ children }: OrgAppShellProps) {
  return (
    <SidebarProvider>
      <ChannelProvider>
        <OrgAppShellContent>{children}</OrgAppShellContent>
      </ChannelProvider>
    </SidebarProvider>
  );
}
