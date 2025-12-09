import { ReactNode } from "react";
import { motion } from "framer-motion";
import { SidebarNavigation } from "./SidebarNavigation";
import { TopBar } from "./TopBar";
import { Zap } from "lucide-react";

interface OrgAppShellProps {
  children: ReactNode;
}

export function OrgAppShell({ children }: OrgAppShellProps) {
  return (
    <div className="min-h-screen flex w-full">
      {/* Sidebar */}
      <motion.aside
        initial={{ x: -260 }}
        animate={{ x: 0 }}
        transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="w-[260px] bg-sidebar flex flex-col fixed h-screen z-40"
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-5 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center">
              <Zap className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold text-sidebar-foreground tracking-tight">
              Syntine
            </span>
          </div>
        </div>

        {/* Navigation */}
        <SidebarNavigation variant="org" />

        {/* Footer */}
        <div className="p-4 border-t border-sidebar-border">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="h-8 w-8 rounded-full bg-sidebar-accent flex items-center justify-center">
              <span className="text-xs font-medium text-sidebar-foreground">AC</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">
                Acme Corp
              </p>
              <p className="text-xs text-sidebar-muted truncate">Pro Plan</p>
            </div>
          </div>
        </div>
      </motion.aside>

      {/* Main content area */}
      <div className="flex-1 ml-[260px]">
        <TopBar workspaceName="Acme Corp" variant="org" />
        <main className="bg-background min-h-[calc(100vh-64px)]">
          {children}
        </main>
      </div>
    </div>
  );
}
