import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AdminAppShell } from "@/components/layout/AdminAppShell";
import { PageContainer } from "@/components/layout/PageContainer";
import { OrgStatusPill } from "@/components/admin/OrgStatusPill";
import { OrgUsageChart } from "@/components/admin/OrgUsageChart";
import { AdminLogsTable, AdminLogEntry } from "@/components/admin/AdminLogsTable";
import { AdminLogDetailsDrawer } from "@/components/admin/AdminLogDetailsDrawer";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  Building2,
  Mail,
  Globe,
  CreditCard,
  Calendar,
  ExternalLink,
  Ban,
  UserCog,
  ArrowLeft,
  Phone,
  Users,
  TrendingUp,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Mock organization data
const mockOrgData = {
  id: "org_1",
  name: "Acme Corporation",
  domain: "acme.com",
  email: "admin@acme.com",
  plan: "Enterprise",
  status: "active" as const,
  createdAt: "Jan 15, 2024",
  totalCalls: 12840,
  totalContacts: 4520,
  activeAgents: 8,
  monthlySpend: "$2,480",
};

// Mock logs for this org
const mockOrgLogs: AdminLogEntry[] = Array.from({ length: 8 }, (_, i) => ({
  id: `log-org-${i + 1}`,
  timestamp: new Date(Date.now() - i * 1000 * 60 * Math.random() * 120),
  level: (["info", "warning", "error", "success"] as const)[
    Math.floor(Math.random() * 4)
  ],
  service: ["Agent", "Dialer", "API", "Auth"][Math.floor(Math.random() * 4)],
  message: [
    "Agent completed call successfully",
    "Campaign started: Q1 Renewal",
    "API rate limit warning: 75% capacity",
    "User login: admin@acme.com",
    "Call recording uploaded",
    "Webhook delivery successful",
    "Contact import completed",
    "Agent response latency spike detected",
  ][Math.floor(Math.random() * 8)],
  requestId: `req_${Math.random().toString(36).substring(2, 10)}`,
  orgId: "org_1",
  details: {
    duration: `${Math.floor(Math.random() * 500)}ms`,
  },
}));

const OrganizationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedLog, setSelectedLog] = useState<AdminLogEntry | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleImpersonate = () => {
    toast({
      title: "Impersonating Organization",
      description: `Opening ${mockOrgData.name} workspace in a new tab (mock).`,
    });
    window.open("/app/dashboard", "_blank");
  };

  const handleSuspend = () => {
    toast({
      title: "Organization Suspended",
      description: `${mockOrgData.name} has been suspended (mock).`,
      variant: "destructive",
    });
  };

  const handleViewLogDetails = (log: AdminLogEntry) => {
    setSelectedLog(log);
    setDrawerOpen(true);
  };

  return (
    <AdminAppShell>
      <PageContainer
        title={mockOrgData.name}
        subtitle={`Organization ID: ${id}`}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => navigate("/admin/organizations")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <Button variant="outline" onClick={handleImpersonate}>
              <ExternalLink className="h-4 w-4 mr-2" />
              Impersonate
            </Button>
            <Button variant="destructive" onClick={handleSuspend}>
              <Ban className="h-4 w-4 mr-2" />
              Suspend
            </Button>
          </div>
        }
      >
        <div className="space-y-6">
          {/* Organization Profile Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-xl border border-border/50 p-6 shadow-sm"
          >
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-xl bg-admin-accent/10 flex items-center justify-center">
                  <Building2 className="h-7 w-7 text-admin-accent" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-foreground">
                    {mockOrgData.name}
                  </h2>
                  <p className="text-sm text-muted-foreground">{mockOrgData.domain}</p>
                </div>
              </div>
              <OrgStatusPill status={mockOrgData.status} />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Mail className="h-4 w-4" />
                  <span className="text-xs">Email</span>
                </div>
                <p className="text-sm font-medium text-foreground">{mockOrgData.email}</p>
              </div>
              <div className="p-4 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Globe className="h-4 w-4" />
                  <span className="text-xs">Domain</span>
                </div>
                <p className="text-sm font-medium text-foreground">{mockOrgData.domain}</p>
              </div>
              <div className="p-4 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <CreditCard className="h-4 w-4" />
                  <span className="text-xs">Plan</span>
                </div>
                <p className="text-sm font-medium text-foreground">{mockOrgData.plan}</p>
              </div>
              <div className="p-4 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Calendar className="h-4 w-4" />
                  <span className="text-xs">Created</span>
                </div>
                <p className="text-sm font-medium text-foreground">{mockOrgData.createdAt}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 mt-5 pt-5 border-t border-border/50">
              <Button variant="outline" size="sm">
                <UserCog className="h-4 w-4 mr-1.5" />
                Change Plan
              </Button>
              <Button variant="outline" size="sm">
                <Mail className="h-4 w-4 mr-1.5" />
                Contact Admin
              </Button>
            </div>
          </motion.div>

          {/* Usage Metrics Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Total Calls", value: mockOrgData.totalCalls.toLocaleString(), icon: Phone },
              { label: "Total Contacts", value: mockOrgData.totalContacts.toLocaleString(), icon: Users },
              { label: "Active Agents", value: mockOrgData.activeAgents, icon: TrendingUp },
              { label: "Monthly Spend", value: mockOrgData.monthlySpend, icon: CreditCard },
            ].map((metric, i) => (
              <motion.div
                key={metric.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.05 }}
                className="bg-card rounded-xl border border-border/50 p-5 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{metric.label}</p>
                    <p className="text-2xl font-bold text-foreground mt-1">
                      {metric.value}
                    </p>
                  </div>
                  <div className="h-10 w-10 rounded-lg bg-admin-accent/10 flex items-center justify-center">
                    <metric.icon className="h-5 w-5 text-admin-accent" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Usage Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-card rounded-xl border border-border/50 p-6 shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-semibold text-foreground">
                  Call Usage Trend
                </h3>
                <p className="text-sm text-muted-foreground">Last 30 days</p>
              </div>
            </div>
            <OrgUsageChart delay={0.35} />
          </motion.div>

          {/* Organization Logs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-card rounded-xl border border-border/50 p-6 shadow-sm"
          >
            <div className="mb-4">
              <h3 className="text-base font-semibold text-foreground">
                Recent Logs
              </h3>
              <p className="text-sm text-muted-foreground">
                System events for this organization
              </p>
            </div>
            <AdminLogsTable
              logs={mockOrgLogs}
              onViewDetails={handleViewLogDetails}
              compact
            />
          </motion.div>
        </div>

        <AdminLogDetailsDrawer
          log={selectedLog}
          open={drawerOpen}
          onOpenChange={setDrawerOpen}
        />
      </PageContainer>
    </AdminAppShell>
  );
};

export default OrganizationDetail;
