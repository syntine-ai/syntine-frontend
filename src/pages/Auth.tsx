import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Zap, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { z } from "zod";

// Validation schemas
const loginSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const signupSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required").max(50, "First name is too long"),
  lastName: z.string().trim().min(1, "Last name is required").max(50, "Last name is too long"),
  organizationName: z.string().trim().min(2, "Organization name must be at least 2 characters").max(100, "Organization name is too long"),
  email: z.string().trim().email("Please enter a valid email address"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type LoginFormData = z.infer<typeof loginSchema>;
type SignupFormData = z.infer<typeof signupSchema>;

const Auth = () => {
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");
  
  // Login state
  const [loginData, setLoginData] = useState<LoginFormData>({ email: "", password: "" });
  const [loginErrors, setLoginErrors] = useState<Partial<LoginFormData>>({});
  
  // Signup state
  const [signupData, setSignupData] = useState<SignupFormData>({
    firstName: "",
    lastName: "",
    organizationName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [signupErrors, setSignupErrors] = useState<Partial<Record<keyof SignupFormData, string>>>({});
  
  // Shared state
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { signIn, signUp, user, isLoading } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (user && !isLoading) {
      navigate("/app/dashboard", { replace: true });
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

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSignupErrors({});

    // Validate
    const result = signupSchema.safeParse(signupData);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof SignupFormData, string>> = {};
      result.error.errors.forEach((err) => {
        const field = err.path[0] as keyof SignupFormData;
        fieldErrors[field] = err.message;
      });
      setSignupErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);
    const { error: signUpError } = await signUp(
      result.data.email,
      result.data.password,
      {
        firstName: result.data.firstName,
        lastName: result.data.lastName,
        organizationName: result.data.organizationName,
      }
    );
    
    setIsSubmitting(false);
    
    if (signUpError) {
      setError(signUpError);
    } else {
      setSuccess("Account created! Please check your email to confirm your account.");
      setSignupData({
        firstName: "",
        lastName: "",
        organizationName: "",
        email: "",
        password: "",
        confirmPassword: "",
      });
    }
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
            <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center">
              <Zap className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold text-foreground tracking-tight">Syntine</span>
          </div>

          <Card className="shadow-elevated border-border bg-card">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-2xl">
                {activeTab === "login" ? "Welcome back" : "Create your account"}
              </CardTitle>
              <CardDescription>
                {activeTab === "login" 
                  ? "Sign in to access your workspace" 
                  : "Get started with Syntine AI Calling"
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={(v) => {
                setActiveTab(v as "login" | "signup");
                setError(null);
                setSuccess(null);
              }}>
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="login">Sign In</TabsTrigger>
                  <TabsTrigger value="signup">Sign Up</TabsTrigger>
                </TabsList>

                {error && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {success && (
                  <Alert className="mb-4 border-success/40 bg-success/10">
                    <CheckCircle2 className="h-4 w-4 text-success" />
                    <AlertDescription className="text-success">{success}</AlertDescription>
                  </Alert>
                )}

                {/* Login Form */}
                <TabsContent value="login">
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
                </TabsContent>

                {/* Signup Form */}
                <TabsContent value="signup">
                  <form className="space-y-4" onSubmit={handleSignup}>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input 
                          id="firstName" 
                          placeholder="John"
                          value={signupData.firstName}
                          onChange={(e) => setSignupData(prev => ({ ...prev, firstName: e.target.value }))}
                          disabled={isSubmitting}
                          className={signupErrors.firstName ? "border-destructive" : ""}
                        />
                        {signupErrors.firstName && (
                          <p className="text-xs text-destructive">{signupErrors.firstName}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input 
                          id="lastName" 
                          placeholder="Doe"
                          value={signupData.lastName}
                          onChange={(e) => setSignupData(prev => ({ ...prev, lastName: e.target.value }))}
                          disabled={isSubmitting}
                          className={signupErrors.lastName ? "border-destructive" : ""}
                        />
                        {signupErrors.lastName && (
                          <p className="text-xs text-destructive">{signupErrors.lastName}</p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="organizationName">Organization Name</Label>
                      <Input 
                        id="organizationName" 
                        placeholder="Acme Inc."
                        value={signupData.organizationName}
                        onChange={(e) => setSignupData(prev => ({ ...prev, organizationName: e.target.value }))}
                        disabled={isSubmitting}
                        className={signupErrors.organizationName ? "border-destructive" : ""}
                      />
                      {signupErrors.organizationName && (
                        <p className="text-xs text-destructive">{signupErrors.organizationName}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email</Label>
                      <Input 
                        id="signup-email" 
                        type="email" 
                        placeholder="you@company.com"
                        value={signupData.email}
                        onChange={(e) => setSignupData(prev => ({ ...prev, email: e.target.value }))}
                        disabled={isSubmitting}
                        className={signupErrors.email ? "border-destructive" : ""}
                      />
                      {signupErrors.email && (
                        <p className="text-xs text-destructive">{signupErrors.email}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Password</Label>
                      <Input 
                        id="signup-password" 
                        type="password" 
                        placeholder="••••••••"
                        value={signupData.password}
                        onChange={(e) => setSignupData(prev => ({ ...prev, password: e.target.value }))}
                        disabled={isSubmitting}
                        className={signupErrors.password ? "border-destructive" : ""}
                      />
                      {signupErrors.password && (
                        <p className="text-xs text-destructive">{signupErrors.password}</p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Min 8 chars, 1 uppercase, 1 lowercase, 1 number
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm Password</Label>
                      <Input 
                        id="confirmPassword" 
                        type="password" 
                        placeholder="••••••••"
                        value={signupData.confirmPassword}
                        onChange={(e) => setSignupData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        disabled={isSubmitting}
                        className={signupErrors.confirmPassword ? "border-destructive" : ""}
                      />
                      {signupErrors.confirmPassword && (
                        <p className="text-xs text-destructive">{signupErrors.confirmPassword}</p>
                      )}
                    </div>

                    <Button className="w-full" type="submit" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating account...
                        </>
                      ) : (
                        "Create Account"
                      )}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
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