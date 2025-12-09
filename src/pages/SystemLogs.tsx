import { useState } from "react";
import { AdminAppShell } from "@/components/layout/AdminAppShell";
import { PageContainer } from "@/components/layout/PageContainer";
import { AdminLogsTable, AdminLogEntry } from "@/components/admin/AdminLogsTable";
import { AdminLogDetailsDrawer } from "@/components/admin/AdminLogDetailsDrawer";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { RefreshCw, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Mock logs data
const mockSystemLogs: AdminLogEntry[] = Array.from({ length: 25 }, (_, i) => ({
  id: `log-${i + 1}`,
  timestamp: new Date(Date.now() - i * 1000 * 60 * Math.random() * 60),
  level: (["info", "warning", "error", "success"] as const)[
    Math.floor(Math.random() * 4)
  ],
  service: ["Agent", "Dialer", "DB", "Worker", "API", "Auth"][
    Math.floor(Math.random() * 6)
  ],
  message: [
    "API rate limit exceeded for org:acme-corp",
    "High memory usage detected on worker-node-3",
    "New organization created: TechStart Inc",
    "Database backup completed successfully",
    "Failed to send email: SMTP connection timeout",
    "User login: admin@syntine.io",
    "Telephony provider latency spike detected",
    "Campaign 'Q1 Renewal' completed",
    "Agent response latency exceeded threshold",
    "Webhook delivery successful to endpoint",
    "Contact list import completed",
    "API key regenerated for organization",
  ][Math.floor(Math.random() * 12)],
  requestId: `req_${Math.random().toString(36).substring(2, 10)}`,
  orgId: ["org_1", "org_2", "org_3", undefined][Math.floor(Math.random() * 4)],
  details: {
    duration: `${Math.floor(Math.random() * 500)}ms`,
    userId: `usr_${Math.random().toString(36).substring(2, 8)}`,
  },
}));

const SystemLogs = () => {
  const [selectedLog, setSelectedLog] = useState<AdminLogEntry | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      toast({
        title: "Logs refreshed",
        description: "Latest log entries have been loaded.",
      });
    }, 1000);
  };

  const handleExport = () => {
    toast({
      title: "Export started",
      description: "Your log export will be ready shortly (mock).",
    });
  };

  const handleViewDetails = (log: AdminLogEntry) => {
    setSelectedLog(log);
    setDrawerOpen(true);
  };

  return (
    <AdminAppShell>
      <PageContainer
        title="System Logs"
        subtitle="Monitor system-wide events and errors"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
          </div>
        }
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-xl border border-border/50 p-6 shadow-sm"
        >
          <AdminLogsTable logs={mockSystemLogs} onViewDetails={handleViewDetails} />
        </motion.div>

        <AdminLogDetailsDrawer
          log={selectedLog}
          open={drawerOpen}
          onOpenChange={setDrawerOpen}
        />
      </PageContainer>
    </AdminAppShell>
  );
};

export default SystemLogs;
