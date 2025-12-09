import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { ReactNode } from "react";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole: "org" | "admin";
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { isAuthenticated, role } = useAuth();

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
