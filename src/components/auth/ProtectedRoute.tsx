import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { ReactNode } from "react";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole: "org" | "admin";
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { isAuthenticated, role } = useAuth();

  // Not authenticated - redirect to appropriate login
  if (!isAuthenticated) {
    return <Navigate to={requiredRole === "admin" ? "/admin/login" : "/login"} replace />;
  }

  // Wrong role - redirect to appropriate login
  if (role !== requiredRole) {
    return <Navigate to={role === "admin" ? "/admin/login" : "/login"} replace />;
  }

  return <>{children}</>;
}
