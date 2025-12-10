import { ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SidebarNavigation } from "./SidebarNavigation";
import { TopBar } from "./TopBar";
import { Shield, Menu, PanelLeftClose } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSidebar, SidebarProvider } from "@/contexts/SidebarContext";
import { cn } from "@/lib/utils";

interface AdminAppShellProps {
  children: ReactNode;
}

function AdminAppShellContent({ children }: AdminAppShellProps) {
  const { isCollapsed, toggleSidebar } = useSidebar();

  return (
    <div className="min-h-screen flex w-full">
      {/* Admin Sidebar with red accent */}
      <motion.aside
        initial={false}
        animate={{ width: isCollapsed ? 72 : 240 }}
        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
        className="bg-sidebar flex flex-col fixed h-screen z-40 overflow-hidden"
      >
        {/* Header with admin badge */}
        <div className="h-16 flex items-center justify-between px-3 border-b border-sidebar-border">
          <motion.div
            className="flex items-center gap-3 overflow-hidden"
            animate={{ justifyContent: isCollapsed ? "center" : "flex-start" }}
          >
            <div className="h-9 w-9 rounded-xl bg-admin-accent flex items-center justify-center shrink-0">
              <Shield className="h-5 w-5 text-admin-accent-foreground" />
            </div>
            <AnimatePresence mode="wait">
              {!isCollapsed && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col overflow-hidden"
                >
                  <span className="text-lg font-semibold text-sidebar-foreground tracking-tight whitespace-nowrap">
                    Syntine
                  </span>
                  <span className="text-[10px] uppercase tracking-wider text-admin-accent font-medium -mt-0.5 whitespace-nowrap">
                    Admin Panel
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className={cn(
              "h-8 w-8 text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-accent shrink-0",
              isCollapsed && "hidden"
            )}
          >
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
              <PanelLeftClose className="h-5 w-5" />
            </motion.div>
          </Button>
        </div>

        {/* Collapsed Toggle */}
        {isCollapsed && (
          <div className="flex justify-center py-3 border-b border-sidebar-border">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="h-8 w-8 text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-accent"
            >
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                <Menu className="h-5 w-5" />
              </motion.div>
            </Button>
          </div>
        )}

        {/* Navigation */}
        <SidebarNavigation variant="admin" />

        {/* Admin Footer */}
        <div className="p-3 border-t border-sidebar-border">
          <motion.div
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg",
              isCollapsed && "justify-center px-0"
            )}
          >
            <div className="h-8 w-8 rounded-full bg-admin-accent/20 flex items-center justify-center ring-2 ring-admin-accent/30 shrink-0">
              <span className="text-xs font-medium text-admin-accent">SA</span>
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
                    Super Admin
                  </p>
                  <p className="text-xs text-admin-accent truncate">Full Access</p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </motion.aside>

      {/* Main content area */}
      <motion.div
        className="flex-1"
        animate={{ marginLeft: isCollapsed ? 72 : 240 }}
        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      >
        <TopBar workspaceName="Admin Console" variant="admin" />
        <main className="bg-background min-h-[calc(100vh-64px)]">
          {children}
        </main>
      </motion.div>
    </div>
  );
}

export function AdminAppShell({ children }: AdminAppShellProps) {
  return (
    <SidebarProvider>
      <AdminAppShellContent>{children}</AdminAppShellContent>
    </SidebarProvider>
  );
}
