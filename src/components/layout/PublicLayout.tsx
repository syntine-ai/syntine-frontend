import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Zap, Shield } from "lucide-react";

interface PublicLayoutProps {
  children: ReactNode;
}

export function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <div className="min-h-screen bg-sidebar text-sidebar-foreground">
      {/* Top Bar */}
      <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-sidebar/80 backdrop-blur-xl border-b border-sidebar-border">
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="Syntine"
              className="h-9 w-9 rounded-xl"
            />
            <span className="text-xl font-bold tracking-tight">Syntine</span>
          </Link>

          {/* Right side buttons - Removed as requested */}
          <div className="flex items-center gap-3">
            {/* Empty or strictly minimal actions if needed */}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-16">{children}</main>
    </div>
  );
}
