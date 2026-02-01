import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { ReactNode } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole: "org" | "admin";
}

function AuthLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, isLoading, isAdmin, isOrgMember, profile } = useAuth();

  // Show loading skeleton while checking auth
  if (isLoading) {
    return <AuthLoadingSkeleton />;
  }

  // Not authenticated at all
  if (!user) {
    if (requiredRole === "admin") {
      return <Navigate to="/admin/login" replace />;
    }
    return <Navigate to="/auth" replace />;
  }

  // User exists but no profile yet (still being created by trigger)
  // If loading is finished and we still have no profile, show error
  if (!profile && requiredRole === "org") {
    if (isLoading) {
      return <AuthLoadingSkeleton />;
    }

    // Profile missing error state
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full flex flex-col items-center text-center gap-4">
          <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertCircle className="h-6 w-6 text-destructive" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Profile Not Found</h3>
            <p className="text-sm text-muted-foreground">
              We couldn't load your user profile. This might happen if your account setup wasn't completed properly.
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
            className="w-full"
          >
            Retry
          </Button>
          <Button
            variant="ghost"
            onClick={() => supabase.auth.signOut()}
            className="w-full text-muted-foreground hover:text-foreground"
          >
            Sign Out
          </Button>
        </div>
      </div>
    );
  }

  // Check role access
  if (requiredRole === "admin" && !isAdmin) {
    // Not an admin, redirect to org dashboard if they have org role
    if (isOrgMember) {
      return <Navigate to="/dashboard" replace />;
    }
    return <Navigate to="/auth" replace />;
  }

  if (requiredRole === "org" && !isOrgMember && !isAdmin) {
    // Not an org member and not an admin
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
}
