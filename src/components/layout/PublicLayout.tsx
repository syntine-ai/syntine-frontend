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
            <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center">
              <Zap className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold tracking-tight">Syntine</span>
          </Link>

          {/* Right side buttons */}
          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button
                variant="ghost"
                className="text-sidebar-foreground hover:bg-sidebar-accent"
              >
                Org Login
              </Button>
            </Link>
            <Link to="/admin/login">
              <Button
                variant="outline"
                className="border-sidebar-border text-sidebar-foreground hover:bg-sidebar-accent gap-2"
              >
                <Shield className="h-4 w-4" />
                Admin Login
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-16">{children}</main>
    </div>
  );
}
