import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { loginAdmin, isAuthenticated, role } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated as admin
  if (isAuthenticated && role === "admin") {
    navigate("/admin", { replace: true });
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginAdmin(email, password);
    navigate("/admin");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-sidebar p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        {/* Admin Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="h-12 w-12 rounded-xl bg-admin-accent flex items-center justify-center">
            <Shield className="h-6 w-6 text-admin-accent-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-bold text-sidebar-foreground tracking-tight">Syntine</span>
            <span className="text-xs uppercase tracking-wider text-admin-accent font-medium -mt-0.5">
              Admin Panel
            </span>
          </div>
        </div>

        <Card className="shadow-elevated border-sidebar-border bg-card">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Admin Console Login</CardTitle>
            <CardDescription>Sign in with your administrator credentials</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="email">Admin Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="admin@syntine.io"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button className="w-full bg-admin-accent hover:bg-admin-accent/90" type="submit">
                Enter Admin Console
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-sidebar-muted mt-8">
          Admin access is logged and monitored. Unauthorized access is prohibited.
        </p>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
