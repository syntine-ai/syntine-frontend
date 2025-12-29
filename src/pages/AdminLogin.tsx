import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, Loader2, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { PublicLayout } from "@/components/layout/PublicLayout";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signIn, user, isLoading, isAdmin } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated as admin
  useEffect(() => {
    if (user && isAdmin && !isLoading) {
      navigate("/admin/organizations", { replace: true });
    }
  }, [user, isAdmin, isLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const { error: signInError } = await signIn(email, password);
    
    if (signInError) {
      setError(signInError);
      setIsSubmitting(false);
    }
    // Navigation handled by useEffect when isAdmin becomes true
  };

  if (isLoading) {
    return (
      <PublicLayout>
        <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4">
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
              <span className="text-2xl font-bold text-foreground tracking-tight">Syntine</span>
              <span className="text-xs uppercase tracking-wider text-admin-accent font-medium -mt-0.5">
                Admin Panel
              </span>
            </div>
          </div>

          <Card className="shadow-elevated border-border bg-card">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Admin Console Login</CardTitle>
              <CardDescription>Sign in with your administrator credentials</CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <Label htmlFor="email">Admin Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="admin@syntine.io"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isSubmitting}
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
                    disabled={isSubmitting}
                    required
                  />
                </div>
                <Button 
                  className="w-full bg-admin-accent hover:bg-admin-accent/90" 
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    "Enter Admin Console"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          <p className="text-center text-xs text-muted-foreground mt-8">
            Admin access is logged and monitored. Unauthorized access is prohibited.
          </p>
        </motion.div>
      </div>
    </PublicLayout>
  );
};

export default AdminLogin;