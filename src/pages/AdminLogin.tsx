import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield } from "lucide-react";

const AdminLogin = () => {
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
            <CardTitle className="text-2xl">Admin Access</CardTitle>
            <CardDescription>Sign in with your administrator credentials</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Admin Email</Label>
                <Input id="email" type="email" placeholder="admin@syntine.io" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" placeholder="••••••••" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="otp">One-Time Password</Label>
                <Input id="otp" type="text" placeholder="Enter 6-digit code" />
              </div>
              <Button className="w-full bg-admin-accent hover:bg-admin-accent/90" type="submit">
                Access Admin Panel
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
