import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { ReactNode } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2 } from "lucide-react";

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
  // Give a brief moment for profile to be fetched
  if (!profile && requiredRole === "org") {
    return <AuthLoadingSkeleton />;
  }

  // Check role access
  if (requiredRole === "admin" && !isAdmin) {
    // Not an admin, redirect to org dashboard if they have org role
    if (isOrgMember) {
      return <Navigate to="/app/dashboard" replace />;
    }
    return <Navigate to="/auth" replace />;
  }

  if (requiredRole === "org" && !isOrgMember && !isAdmin) {
    // Not an org member and not an admin
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
}