import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { ReactNode } from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole: "org" | "admin";
}

function AuthLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-full max-w-md space-y-4 p-8">
        <Skeleton className="h-12 w-12 rounded-xl mx-auto" />
        <Skeleton className="h-6 w-32 mx-auto" />
        <div className="space-y-3 mt-8">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    </div>
  );
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, role } = useAuth();

  // Show loading skeleton while checking auth
  if (isLoading) {
    return <AuthLoadingSkeleton />;
  }

  // Not authenticated at all
  if (!isAuthenticated) {
    if (requiredRole === "admin") {
      return <Navigate to="/admin/login" replace />;
    }
    return <Navigate to="/login" replace />;
  }

  // Authenticated but wrong role - redirect to their dashboard
  if (role !== requiredRole) {
    if (role === "admin") {
      return <Navigate to="/admin/organizations" replace />;
    }
    if (role === "org") {
      return <Navigate to="/app/dashboard" replace />;
    }
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
