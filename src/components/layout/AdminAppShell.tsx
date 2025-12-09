import { ReactNode } from "react";
import { motion } from "framer-motion";
import { SidebarNavigation } from "./SidebarNavigation";
import { TopBar } from "./TopBar";
import { Shield } from "lucide-react";

interface AdminAppShellProps {
  children: ReactNode;
}

export function AdminAppShell({ children }: AdminAppShellProps) {
  return (
    <div className="min-h-screen flex w-full">
      {/* Admin Sidebar with red accent */}
      <motion.aside
        initial={{ x: -260 }}
        animate={{ x: 0 }}
        transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="w-[260px] bg-sidebar flex flex-col fixed h-screen z-40"
      >
        {/* Logo with admin badge */}
        <div className="h-16 flex items-center px-5 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-admin-accent flex items-center justify-center">
              <Shield className="h-5 w-5 text-admin-accent-foreground" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-semibold text-sidebar-foreground tracking-tight">
                Syntine
              </span>
              <span className="text-[10px] uppercase tracking-wider text-admin-accent font-medium -mt-0.5">
                Admin Panel
              </span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <SidebarNavigation variant="admin" />

        {/* Admin Footer */}
        <div className="p-4 border-t border-sidebar-border">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="h-8 w-8 rounded-full bg-admin-accent/20 flex items-center justify-center ring-2 ring-admin-accent/30">
              <span className="text-xs font-medium text-admin-accent">SA</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">
                Super Admin
              </p>
              <p className="text-xs text-admin-accent truncate">Full Access</p>
            </div>
          </div>
        </div>
      </motion.aside>

      {/* Main content area */}
      <div className="flex-1 ml-[260px]">
        <TopBar workspaceName="Admin Console" variant="admin" />
        <main className="bg-background min-h-[calc(100vh-64px)]">
          {children}
        </main>
      </div>
    </div>
  );
}
