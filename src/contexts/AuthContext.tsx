import { createContext, useContext, useState, ReactNode } from "react";
import { useNavigate } from "react-router-dom";

type Role = "org" | "admin" | null;

interface AuthContextType {
  isAuthenticated: boolean;
  role: Role;
  loginOrg: (email: string, password: string) => void;
  loginAdmin: (email: string, password: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [role, setRole] = useState<Role>(null);

  const loginOrg = (email: string, password: string) => {
    // Mock login - in production, validate credentials
    setIsAuthenticated(true);
    setRole("org");
  };

  const loginAdmin = (email: string, password: string) => {
    // Mock login - in production, validate credentials
    setIsAuthenticated(true);
    setRole("admin");
  };

  const logout = () => {
    setIsAuthenticated(false);
    setRole(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, role, loginOrg, loginAdmin, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
