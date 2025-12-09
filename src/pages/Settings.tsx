import { useState } from "react";
import { OrgAppShell } from "@/components/layout/OrgAppShell";
import { PageContainer } from "@/components/layout/PageContainer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SettingsCard } from "@/components/settings/SettingsCard";
import { IntegrationCard } from "@/components/settings/IntegrationCard";
import { UsageMeter } from "@/components/settings/UsageMeter";
import { LogsTable, LogEntry } from "@/components/settings/LogsTable";
import { LogDetailsDrawer } from "@/components/settings/LogDetailsDrawer";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  Phone,
  RefreshCw,
  CreditCard,
  Zap,
  ArrowUpRight,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const timezones = ["UTC", "IST", "EST", "PST", "GMT", "CET"];

// Mock logs data
const mockLogs: LogEntry[] = Array.from({ length: 20 }, (_, i) => ({
  id: `log-${i + 1}`,
  timestamp: new Date(Date.now() - i * 1000 * 60 * Math.random() * 60),
  level: (["info", "warning", "error"] as const)[Math.floor(Math.random() * 3)],
  service: ["Agent", "Database", "Telephony", "Dashboard", "API"][
    Math.floor(Math.random() * 5)
  ],
  message: [
    "Successfully connected to telephony provider",
    "Agent completed call with positive sentiment",
    "Database connection timeout - retrying",
    "API rate limit warning: 80% capacity reached",
    "Call recording upload failed - storage full",
    "Webhook delivery successful to endpoint",
    "Agent response latency exceeded threshold",
    "User authentication successful",
    "Campaign scheduled for execution",
    "Contact list import completed",
  ][Math.floor(Math.random() * 10)],
  requestId: `req_${Math.random().toString(36).substring(2, 10)}`,
  details: {
    duration: `${Math.floor(Math.random() * 500)}ms`,
    userId: `usr_${Math.random().toString(36).substring(2, 8)}`,
  },
}));

const Settings = () => {
  const [activeTab, setActiveTab] = useState("general");
  const [isSaving, setIsSaving] = useState(false);
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { toast } = useToast();

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

  const handleViewLogDetails = (log: LogEntry) => {
    setSelectedLog(log);
    setDrawerOpen(true);
  };

  return (
    <OrgAppShell>
      <PageContainer
        title="Settings"
        subtitle="Manage workspace preferences, integrations, usage, and system logs."
      >
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6 bg-muted/50">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="integrations">Integrations</TabsTrigger>
            <TabsTrigger value="plan">Plan & Usage</TabsTrigger>
            <TabsTrigger value="logs">System Logs</TabsTrigger>
          </TabsList>

          <AnimatePresence mode="wait">
            {/* General Tab */}
            <TabsContent value="general" className="mt-0">
              <motion.div
                key="general"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="max-w-3xl space-y-6"
              >
                <SettingsCard
                  title="Organization Profile"
                  description="Basic information about your organization"
                  icon={Building2}
                  delay={0}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="orgName">Organization Name</Label>
                      <Input
                        id="orgName"
                        defaultValue="Acme Corp"
                        className="mt-1.5"
                      />
                    </div>
                    <div>
                      <Label htmlFor="contactEmail">Primary Contact Email</Label>
                      <Input
                        id="contactEmail"
                        type="email"
                        defaultValue="contact@acmecorp.com"
                        className="mt-1.5"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="timezone">Timezone</Label>
                      <Select defaultValue="IST">
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
                  </div>
                </SettingsCard>

                <SettingsCard
                  title="Calling Preferences"
                  description="Configure default calling behavior"
                  icon={Phone}
                  delay={0.1}
                >
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="callerId">Default Caller ID</Label>
                      <Input
                        id="callerId"
                        defaultValue="Acme Support"
                        className="mt-1.5"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="businessStart">Business Hours Start</Label>
                        <Input
                          id="businessStart"
                          type="time"
                          defaultValue="09:00"
                          className="mt-1.5"
                        />
                      </div>
                      <div>
                        <Label htmlFor="businessEnd">Business Hours End</Label>
                        <Input
                          id="businessEnd"
                          type="time"
                          defaultValue="18:00"
                          className="mt-1.5"
                        />
                      </div>
                    </div>
                  </div>
                </SettingsCard>

                <SettingsCard
                  title="Auto-Refresh"
                  description="Control how data updates in your dashboard"
                  icon={RefreshCw}
                  delay={0.2}
                >
                  <div>
                    <Label htmlFor="autoRefresh">Dashboard Auto-Refresh</Label>
                    <Select defaultValue="30">
                      <SelectTrigger className="mt-1.5 w-full md:w-[200px]">
                        <SelectValue placeholder="Select interval" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="off">Off</SelectItem>
                        <SelectItem value="5">5 seconds</SelectItem>
                        <SelectItem value="10">10 seconds</SelectItem>
                        <SelectItem value="30">30 seconds</SelectItem>
                        <SelectItem value="60">60 seconds</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground mt-2">
                      Automatically refresh dashboard metrics at the selected
                      interval
                    </p>
                  </div>
                </SettingsCard>

                <div className="flex justify-end pt-2">
                  <Button onClick={handleSave} disabled={isSaving}>
                    {isSaving ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </motion.div>
            </TabsContent>

            {/* Integrations Tab */}
            <TabsContent value="integrations" className="mt-0">
              <motion.div
                key="integrations"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="max-w-3xl space-y-4"
              >
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-foreground">
                    Connected Integrations
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Manage your third-party connections and automations
                  </p>
                </div>

                <IntegrationCard
                  name="Exotel"
                  description="Used for outbound voice calls."
                  status="connected"
                  buttonLabel="Configure"
                  delay={0}
                />
                <IntegrationCard
                  name="n8n Automation"
                  description="Trigger workflows when calls start or end."
                  status="connected"
                  buttonLabel="Configure"
                  delay={0.1}
                />
                <IntegrationCard
                  name="Webhooks"
                  description="Send call data to any external system."
                  status="not_configured"
                  buttonLabel="Set Up"
                  delay={0.2}
                />
              </motion.div>
            </TabsContent>

            {/* Plan & Usage Tab */}
            <TabsContent value="plan" className="mt-0">
              <motion.div
                key="plan"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="max-w-3xl space-y-6"
              >
                <SettingsCard
                  title="Current Plan"
                  description="Your subscription details"
                  icon={CreditCard}
                  delay={0}
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-primary/5 rounded-lg border border-primary/20">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Zap className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">Pro Plan</p>
                          <p className="text-sm text-muted-foreground">
                            Next billing date: Apr 10, 2025
                          </p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        <ArrowUpRight className="h-4 w-4 mr-1.5" />
                        Upgrade Plan
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="p-3 bg-muted/30 rounded-lg">
                        <p className="text-muted-foreground">Monthly Price</p>
                        <p className="text-lg font-semibold text-foreground">
                          $99.00
                        </p>
                      </div>
                      <div className="p-3 bg-muted/30 rounded-lg">
                        <p className="text-muted-foreground">Billing Cycle</p>
                        <p className="text-lg font-semibold text-foreground">
                          Monthly
                        </p>
                      </div>
                    </div>
                  </div>
                </SettingsCard>

                <SettingsCard
                  title="Usage Overview"
                  description="Track your resource consumption this billing period"
                  icon={RefreshCw}
                  delay={0.1}
                >
                  <UsageMeter
                    items={[
                      { label: "Calls This Month", value: 1240, limit: 5000 },
                      { label: "API Requests", value: 8200, limit: 20000 },
                      { label: "Storage Used", value: 2.4, limit: 10, unit: "GB" },
                    ]}
                  />
                </SettingsCard>
              </motion.div>
            </TabsContent>

            {/* System Logs Tab */}
            <TabsContent value="logs" className="mt-0">
              <motion.div
                key="logs"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                <div className="mb-2">
                  <h3 className="text-lg font-semibold text-foreground">
                    System Logs
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    View internal system events for debugging and observability
                  </p>
                </div>

                <LogsTable logs={mockLogs} onViewDetails={handleViewLogDetails} />
              </motion.div>
            </TabsContent>
          </AnimatePresence>
        </Tabs>

        <LogDetailsDrawer
          log={selectedLog}
          open={drawerOpen}
          onOpenChange={setDrawerOpen}
        />
      </PageContainer>
    </OrgAppShell>
  );
};

export default Settings;
