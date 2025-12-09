import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Role = "org" | "admin" | null;

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  role: Role;
  loginOrg: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loginAdmin: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [role, setRole] = useState<Role>(null);

  // Simulate checking for existing session on mount
  useEffect(() => {
    const checkAuth = async () => {
      // Mock delay to simulate auth check
      await new Promise((resolve) => setTimeout(resolve, 500));
      setIsLoading(false);
    };
    checkAuth();
  }, []);

  const loginOrg = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    // Mock login - simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 800));
    
    // Mock validation - accept any valid email format with password length > 5
    if (!email.includes("@") || password.length < 6) {
      return { success: false, error: "Invalid email or password" };
    }
    
    setIsAuthenticated(true);
    setRole("org");
    return { success: true };
  };

  const loginAdmin = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    // Mock login - simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 800));
    
    // Mock validation - for demo, require @syntine.io domain
    if (!email.endsWith("@syntine.io") || password.length < 6) {
      return { success: false, error: "Invalid admin credentials" };
    }
    
    setIsAuthenticated(true);
    setRole("admin");
    return { success: true };
  };

  const logout = () => {
    setIsAuthenticated(false);
    setRole(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, role, loginOrg, loginAdmin, logout }}>
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
