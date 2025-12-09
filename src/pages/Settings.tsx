import { OrgAppShell } from "@/components/layout/OrgAppShell";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { motion } from "framer-motion";

const Settings = () => {
  return (
    <OrgAppShell>
      <PageContainer
        title="Settings"
        subtitle="Manage your workspace preferences and configuration"
      >
        <div className="max-w-2xl space-y-6">
          {/* Organization Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-lg shadow-card border border-border/50 p-6"
          >
            <h2 className="text-lg font-semibold text-foreground mb-4">Organization</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="orgName">Organization Name</Label>
                <Input id="orgName" defaultValue="Acme Corp" className="mt-1.5" />
              </div>
              <div>
                <Label htmlFor="orgSlug">Workspace URL</Label>
                <Input id="orgSlug" defaultValue="acme-corp" className="mt-1.5" />
              </div>
            </div>
          </motion.div>

          {/* Notifications */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card rounded-lg shadow-card border border-border/50 p-6"
          >
            <h2 className="text-lg font-semibold text-foreground mb-4">Notifications</h2>
            <div className="space-y-4">
              {[
                { label: "Email notifications", description: "Receive email updates about your campaigns", defaultChecked: true },
                { label: "Weekly digest", description: "Get a weekly summary of your performance", defaultChecked: true },
                { label: "Real-time alerts", description: "Instant notifications for important events", defaultChecked: false },
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

          {/* Save Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Button>Save Changes</Button>
          </motion.div>
        </div>
      </PageContainer>
    </OrgAppShell>
  );
};

export default Settings;
