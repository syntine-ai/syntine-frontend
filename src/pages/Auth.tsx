import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { z } from "zod";

// Validation schemas
const loginSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

const Auth = () => {
  // Login state
  const [loginData, setLoginData] = useState<LoginFormData>({ email: "", password: "" });
  const [loginErrors, setLoginErrors] = useState<Partial<LoginFormData>>({});

  // Shared state
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { signIn, user, isLoading } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (user && !isLoading) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, isLoading, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoginErrors({});

    // Validate
    const result = loginSchema.safeParse(loginData);
    if (!result.success) {
      const fieldErrors: Partial<LoginFormData> = {};
      result.error.errors.forEach((err) => {
        const field = err.path[0] as keyof LoginFormData;
        fieldErrors[field] = err.message;
      });
      setLoginErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);
    const { error: signInError } = await signIn(result.data.email, result.data.password);

    if (signInError) {
      setError(signInError);
      setIsSubmitting(false);
    }
    // Navigation is handled by useEffect when user state changes
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
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          {/* Logo */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <img
              src="/logo.png"
              alt="Syntine"
              className="h-12 w-12 rounded-xl"
            />
            <span className="text-2xl font-bold text-foreground tracking-tight">Syntine</span>
          </div>

          <Card className="shadow-elevated border-border bg-card">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-2xl">
                Welcome back
              </CardTitle>
              <CardDescription>
                Sign in to access your workspace
              </CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Login Form */}
              <form className="space-y-4" onSubmit={handleLogin}>
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="you@company.com"
                    value={loginData.email}
                    onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
                    disabled={isSubmitting}
                    className={loginErrors.email ? "border-destructive" : ""}
                  />
                  {loginErrors.email && (
                    <p className="text-xs text-destructive">{loginErrors.email}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="login-password">Password</Label>
                    <Link to="#" className="text-sm text-primary hover:underline">
                      Forgot password?
                    </Link>
                  </div>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="••••••••"
                    value={loginData.password}
                    onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                    disabled={isSubmitting}
                    className={loginErrors.password ? "border-destructive" : ""}
                  />
                  {loginErrors.password && (
                    <p className="text-xs text-destructive">{loginErrors.password}</p>
                  )}
                </div>
                <Button className="w-full" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          <p className="text-center text-xs text-muted-foreground mt-8">
            By continuing, you agree to our{" "}
            <Link to="#" className="text-primary hover:underline">Terms of Service</Link>
            {" "}and{" "}
            <Link to="#" className="text-primary hover:underline">Privacy Policy</Link>.
          </p>
        </motion.div>
      </div>
    </PublicLayout>
  );
};

export default Auth;
