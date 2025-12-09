import { OrgAppShell } from "@/components/layout/OrgAppShell";
import { PageContainer } from "@/components/layout/PageContainer";
import { SystemStatusIndicator, type ServiceStatus } from "@/components/shared/SystemStatusIndicator";
import { ServiceHealthCard } from "@/components/shared/ServiceHealthCard";
import { motion } from "framer-motion";
import { RefreshCw, Activity, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface Service {
  name: string;
  status: ServiceStatus;
  lastCheck: string;
  responseTime: string;
}

const mockServices: Service[] = [
  { name: "Database Server", status: "operational", lastCheck: "2 min ago", responseTime: "12ms" },
  { name: "AI Agent Service", status: "operational", lastCheck: "1 min ago", responseTime: "145ms" },
  { name: "Telephony Provider", status: "degraded", lastCheck: "30 sec ago", responseTime: "892ms" },
  { name: "Dashboard API", status: "operational", lastCheck: "1 min ago", responseTime: "34ms" },
];

const recentIncidents = [
  {
    id: 1,
    title: "Telephony latency increase",
    status: "investigating",
    time: "15 min ago",
    description: "We are investigating increased latency with the telephony provider.",
  },
  {
    id: 2,
    title: "Database maintenance completed",
    status: "resolved",
    time: "2 hours ago",
    description: "Scheduled database maintenance has been completed successfully.",
  },
];

const SystemStatus = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();

  const overallStatus: ServiceStatus = mockServices.some((s) => s.status === "down")
    ? "down"
    : mockServices.some((s) => s.status === "degraded")
    ? "degraded"
    : "operational";

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      toast({
        title: "Status refreshed",
        description: "All service health checks have been updated.",
      });
    }, 1500);
  };

  return (
    <OrgAppShell>
      <PageContainer
        title="System Status"
        subtitle="Monitor the health of all connected services"
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        }
      >
        <div className="space-y-8">
          {/* Overall Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <SystemStatusIndicator status={overallStatus} />
          </motion.div>

          {/* Service Health Grid */}
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Service Health
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {mockServices.map((service, index) => (
                <ServiceHealthCard
                  key={service.name}
                  name={service.name}
                  status={service.status}
                  lastCheck={service.lastCheck}
                  responseTime={service.responseTime}
                  index={index}
                />
              ))}
            </div>
          </div>

          {/* Recent Incidents */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Recent Incidents
            </h2>
            <div className="bg-card rounded-lg border border-border/50 divide-y divide-border/50">
              {recentIncidents.map((incident) => (
                <div key={incident.id} className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-medium text-foreground">{incident.title}</h3>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-medium ${
                          incident.status === "resolved"
                            ? "bg-success/10 text-success"
                            : "bg-warning/10 text-warning"
                        }`}
                      >
                        {incident.status.charAt(0).toUpperCase() + incident.status.slice(1)}
                      </span>
                      <span className="text-xs text-muted-foreground">{incident.time}</span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{incident.description}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Uptime Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            {[
              { label: "30-Day Uptime", value: "99.94%", sub: "4 incidents" },
              { label: "Avg Response Time", value: "127ms", sub: "Last 24 hours" },
              { label: "Successful Calls", value: "99.2%", sub: "Last 7 days" },
            ].map((stat, i) => (
              <div
                key={stat.label}
                className="bg-card rounded-lg border border-border/50 p-4 text-center"
              >
                <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{stat.sub}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </PageContainer>
    </OrgAppShell>
  );
};

export default SystemStatus;
