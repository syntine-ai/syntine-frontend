import { AdminAppShell } from "@/components/layout/AdminAppShell";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { motion } from "framer-motion";

const AdminSettings = () => {
  return (
    <AdminAppShell>
      <PageContainer
        title="Admin Settings"
        subtitle="System configuration and preferences"
      >
        <div className="max-w-2xl space-y-6">
          {/* System Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-lg shadow-card border border-border/50 p-6"
          >
            <h2 className="text-lg font-semibold text-foreground mb-4">System Configuration</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="apiLimit">Default API Rate Limit</Label>
                <Input id="apiLimit" defaultValue="1000" type="number" className="mt-1.5" />
                <p className="text-xs text-muted-foreground mt-1">Requests per minute per organization</p>
              </div>
              <div>
                <Label htmlFor="retention">Log Retention Period</Label>
                <Input id="retention" defaultValue="30" type="number" className="mt-1.5" />
                <p className="text-xs text-muted-foreground mt-1">Days to keep system logs</p>
              </div>
            </div>
          </motion.div>

          {/* Security */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card rounded-lg shadow-card border border-border/50 p-6"
          >
            <h2 className="text-lg font-semibold text-foreground mb-4">Security</h2>
            <div className="space-y-4">
              {[
                { label: "Two-factor authentication", description: "Require 2FA for all admin users", defaultChecked: true },
                { label: "IP whitelisting", description: "Restrict admin access to specific IPs", defaultChecked: false },
                { label: "Audit logging", description: "Log all administrative actions", defaultChecked: true },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">{item.label}</p>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                  <Switch defaultChecked={item.defaultChecked} />
                </div>
              ))}
            </div>
          </motion.div>

          {/* Danger Zone */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card rounded-lg shadow-card border border-destructive/30 p-6"
          >
            <h2 className="text-lg font-semibold text-destructive mb-4">Danger Zone</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Clear all system logs</p>
                  <p className="text-sm text-muted-foreground">Permanently delete all system logs</p>
                </div>
                <Button variant="destructive" size="sm">Clear Logs</Button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Reset rate limits</p>
                  <p className="text-sm text-muted-foreground">Reset all organization rate limits</p>
                </div>
                <Button variant="destructive" size="sm">Reset</Button>
              </div>
            </div>
          </motion.div>

          {/* Save Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Button className="bg-admin-accent hover:bg-admin-accent/90">Save Settings</Button>
          </motion.div>
        </div>
      </PageContainer>
    </AdminAppShell>
  );
};

export default AdminSettings;
