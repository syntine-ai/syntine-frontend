import { useState, useEffect, useCallback } from "react";
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
import { LogsTable, LogEntry } from "@/components/settings/LogsTable";
import { LogDetailsDrawer } from "@/components/settings/LogDetailsDrawer";
import { SkeletonCard } from "@/components/shared/SkeletonCard";
import { motion, AnimatePresence } from "framer-motion";
import { Building2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const timezones = ["UTC", "IST", "EST", "PST", "GMT", "CET"];

interface OrganizationSettings {
  caller_id?: string;
  business_hours_start?: string;
  business_hours_end?: string;
  auto_refresh_interval?: string;
}

const Settings = () => {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState("general");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { toast } = useToast();

  // Organization data
  const [orgName, setOrgName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [timezone, setTimezone] = useState("UTC");

  // Settings from organization.settings JSON
  const [callerId, setCallerId] = useState("");
  const [businessStart, setBusinessStart] = useState("09:00");
  const [businessEnd, setBusinessEnd] = useState("18:00");
  const [autoRefresh, setAutoRefresh] = useState("30");

  // Activity logs
  const [logs, setLogs] = useState<LogEntry[]>([]);

  // Fetch organization and settings data
  useEffect(() => {
    const fetchData = async () => {
      if (!profile?.organization_id) {
        setIsLoading(false);
        return;
      }

      try {
        // Fetch organization
        const { data: org, error: orgError } = await supabase
          .from("organizations")
          .select("*")
          .eq("id", profile.organization_id)
          .single();

        if (orgError) throw orgError;

        if (org) {
          setOrgName(org.name || "");
          setContactEmail(org.email || "");

          // Parse settings JSON
          const settings = (org.settings as OrganizationSettings) || {};
          setCallerId(settings.caller_id || org.name || "");
          setBusinessStart(settings.business_hours_start || "09:00");
          setBusinessEnd(settings.business_hours_end || "18:00");
          setAutoRefresh(settings.auto_refresh_interval || "30");
        }

        // Fetch profile timezone
        if (profile.timezone) {
          setTimezone(profile.timezone);
        }

        // Fetch activity logs
        const { data: logsData, error: logsError } = await supabase
          .from("activity_logs")
          .select("*")
          .eq("organization_id", profile.organization_id)
          .order("created_at", { ascending: false })
          .limit(50);

        if (!logsError && logsData) {
          const formattedLogs: LogEntry[] = logsData.map((log) => ({
            id: log.id,
            timestamp: new Date(log.created_at || Date.now()),
            level: (log.level as "info" | "warning" | "error") || "info",
            service: log.service || "System",
            message: log.message || log.action,
            requestId: log.resource_id || undefined,
            details: log.details as Record<string, any> || undefined,
          }));
          setLogs(formattedLogs);
        }

      } catch (err) {
        console.error("Error fetching settings:", err);
        toast({
          title: "Error",
          description: "Failed to load settings",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [profile?.organization_id, profile?.timezone, toast]);

  const handleSave = async () => {
    if (!profile?.organization_id) return;

    setIsSaving(true);
    try {
      // Update organization
      const settings: OrganizationSettings = {
        caller_id: callerId,
        business_hours_start: businessStart,
        business_hours_end: businessEnd,
        auto_refresh_interval: autoRefresh,
      };

      const { error: orgError } = await supabase
        .from("organizations")
        .update({
          name: orgName,
          email: contactEmail,
          settings: settings as any,
          updated_at: new Date().toISOString(),
        })
        .eq("id", profile.organization_id);

      if (orgError) throw orgError;

      // Update profile timezone
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          timezone: timezone,
          updated_at: new Date().toISOString(),
        })
        .eq("id", profile.id);

      if (profileError) throw profileError;

      toast({
        title: "Settings saved",
        description: "Your changes have been saved successfully.",
      });
    } catch (err) {
      console.error("Error saving settings:", err);
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleViewLogDetails = (log: LogEntry) => {
    setSelectedLog(log);
    setDrawerOpen(true);
  };

  if (isLoading) {
    return (
      <PageContainer
        title="Settings"
        subtitle="Loading settings..."
      >
        <div className="max-w-3xl space-y-6">
          <SkeletonCard className="h-[200px]" />
          <SkeletonCard className="h-[150px]" />
          <SkeletonCard className="h-[100px]" />
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title="Settings"
      subtitle="Manage workspace preferences, integrations, usage, and system logs."
    >
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6 bg-muted/50">
          <TabsTrigger value="general">General</TabsTrigger>
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
                      value={orgName}
                      onChange={(e) => setOrgName(e.target.value)}
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label htmlFor="contactEmail">Primary Contact Email</Label>
                    <Input
                      id="contactEmail"
                      type="email"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      className="mt-1.5"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select value={timezone} onValueChange={setTimezone}>
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
              <div className="flex justify-end pt-2">
                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
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

              {logs.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  No system logs available
                </div>
              ) : (
                <LogsTable logs={logs} onViewDetails={handleViewLogDetails} />
              )}
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
  );
};

export default Settings;
