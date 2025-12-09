import { OrgAppShell } from "@/components/layout/OrgAppShell";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion } from "framer-motion";
import { Building2, Phone, Clock, RefreshCw, Key, Copy, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const timezones = [
  "Asia/Kolkata",
  "America/New_York",
  "America/Los_Angeles",
  "Europe/London",
  "Europe/Paris",
  "Asia/Tokyo",
  "Asia/Singapore",
];

const countryCodes = ["+91", "+1", "+44", "+61", "+65", "+81"];

const Settings = () => {
  const [showApiKey, setShowApiKey] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const mockApiKey = "sk_live_xKj9mN2pQr5sT8vW3yZ1aB4cD6eF7gH";

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast({
        title: "Settings saved",
        description: "Your changes have been saved successfully.",
      });
    }, 1000);
  };

  const handleCopyApiKey = () => {
    navigator.clipboard.writeText(mockApiKey);
    toast({
      title: "API Key copied",
      description: "The API key has been copied to your clipboard.",
    });
  };

  const handleRegenerateKey = () => {
    toast({
      title: "API Key regenerated",
      description: "A new API key has been generated (mock).",
    });
  };

  return (
    <OrgAppShell>
      <PageContainer
        title="Settings"
        subtitle="Manage your workspace preferences and configuration"
      >
        <div className="max-w-3xl space-y-6">
          {/* Organization Profile */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-lg shadow-card border border-border/50 p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">Organization Profile</h2>
                <p className="text-sm text-muted-foreground">Basic information about your organization</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="orgName">Organization Name</Label>
                <Input id="orgName" defaultValue="Acme Corp" className="mt-1.5" />
              </div>
              <div>
                <Label htmlFor="contactEmail">Contact Email</Label>
                <Input id="contactEmail" type="email" defaultValue="contact@acmecorp.com" className="mt-1.5" />
              </div>
              <div>
                <Label htmlFor="supportPhone">Support Phone</Label>
                <Input id="supportPhone" defaultValue="+91 98765 43210" className="mt-1.5" />
              </div>
              <div>
                <Label htmlFor="timezone">Timezone</Label>
                <Select defaultValue="Asia/Kolkata">
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Select timezone" />
                  </SelectTrigger>
                  <SelectContent>
                    {timezones.map((tz) => (
                      <SelectItem key={tz} value={tz}>
                        {tz}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="countryCode">Default Country Code</Label>
                <Select defaultValue="+91">
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Select country code" />
                  </SelectTrigger>
                  <SelectContent>
                    {countryCodes.map((code) => (
                      <SelectItem key={code} value={code}>
                        {code}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </motion.div>

          {/* Calling Preferences */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card rounded-lg shadow-card border border-border/50 p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Phone className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">Calling Preferences</h2>
                <p className="text-sm text-muted-foreground">Configure default calling behavior</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="businessStart">Business Hours Start</Label>
                  <Input id="businessStart" type="time" defaultValue="09:00" className="mt-1.5" />
                </div>
                <div>
                  <Label htmlFor="businessEnd">Business Hours End</Label>
                  <Input id="businessEnd" type="time" defaultValue="18:00" className="mt-1.5" />
                </div>
              </div>
              <div>
                <Label htmlFor="callerId">Default Caller ID Label</Label>
                <Input
                  id="callerId"
                  defaultValue="Acme Support"
                  placeholder="e.g., Company Support"
                  className="mt-1.5"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  This label may appear on recipients' caller ID (carrier dependent)
                </p>
              </div>
            </div>
          </motion.div>

          {/* Data & Refresh */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card rounded-lg shadow-card border border-border/50 p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <RefreshCw className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">Data & Refresh</h2>
                <p className="text-sm text-muted-foreground">Control how data updates in your dashboard</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Auto-refresh analytics</p>
                  <p className="text-sm text-muted-foreground">
                    When enabled, dashboard stats auto-refresh every 30 seconds
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Real-time call notifications</p>
                  <p className="text-sm text-muted-foreground">
                    Get notified immediately when calls complete
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Weekly analytics digest</p>
                  <p className="text-sm text-muted-foreground">
                    Receive a weekly summary email of your performance
                  </p>
                </div>
                <Switch />
              </div>
            </div>
          </motion.div>

          {/* API & Integration */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-card rounded-lg shadow-card border border-border/50 p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Key className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">API & Integration</h2>
                <p className="text-sm text-muted-foreground">Manage your API access credentials</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label>API Key</Label>
                <div className="flex items-center gap-2 mt-1.5">
                  <div className="flex-1 relative">
                    <Input
                      type={showApiKey ? "text" : "password"}
                      value={mockApiKey}
                      readOnly
                      className="pr-20 font-mono text-sm"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-7"
                      onClick={() => setShowApiKey(!showApiKey)}
                    >
                      {showApiKey ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <Button variant="outline" size="icon" onClick={handleCopyApiKey}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Use this key to authenticate API requests. Keep it secret!
                </p>
              </div>

              <Button variant="destructive" size="sm" onClick={handleRegenerateKey}>
                Regenerate API Key
              </Button>
            </div>
          </motion.div>

          {/* Save Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex justify-end"
          >
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </motion.div>
        </div>
      </PageContainer>
    </OrgAppShell>
  );
};

export default Settings;
