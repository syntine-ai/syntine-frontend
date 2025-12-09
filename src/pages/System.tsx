import { motion } from "framer-motion";
import { AdminAppShell } from "@/components/layout/AdminAppShell";
import { PageContainer } from "@/components/layout/PageContainer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Database,
  Server,
  Phone,
  Activity,
  CheckCircle,
  AlertTriangle,
  XCircle,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ServiceStatus {
  name: string;
  status: "operational" | "degraded" | "outage";
  uptime: string;
  latency: string;
  icon: React.ElementType;
}

interface ErrorLog {
  id: string;
  time: string;
  level: "error" | "warning";
  source: string;
  message: string;
}

const services: ServiceStatus[] = [
  { name: "Database Cluster", status: "operational", uptime: "99.99%", latency: "8ms", icon: Database },
  { name: "Worker Queue", status: "operational", uptime: "99.97%", latency: "12ms", icon: Server },
  { name: "Telephony Provider", status: "degraded", uptime: "99.85%", latency: "145ms", icon: Phone },
];

const recentErrors: ErrorLog[] = [
  { id: "1", time: "Today 3:45:23 PM", level: "error", source: "Telephony", message: "Connection timeout to carrier gateway (retrying...)" },
  { id: "2", time: "Today 3:43:05 PM", level: "error", source: "Database", message: "Connection pool exhausted - max connections reached" },
  { id: "3", time: "Today 3:38:10 PM", level: "warning", source: "API", message: "Rate limit exceeded for client api_key_***abc123" },
  { id: "4", time: "Today 3:35:48 PM", level: "warning", source: "Worker", message: "Job queue depth exceeding threshold (>100 pending)" },
  { id: "5", time: "Today 3:30:22 PM", level: "error", source: "Agent", message: "Model inference timeout - GPT-4 response exceeded 30s" },
  { id: "6", time: "Today 3:25:15 PM", level: "warning", source: "Telephony", message: "High latency detected on outbound calls (>200ms)" },
  { id: "7", time: "Today 3:18:40 PM", level: "error", source: "Storage", message: "S3 upload failed - insufficient permissions" },
  { id: "8", time: "Today 3:12:08 PM", level: "warning", source: "Database", message: "Slow query detected (>5s) on contacts table" },
];

const statusConfig = {
  operational: { label: "Operational", className: "bg-success/15 text-success", icon: CheckCircle },
  degraded: { label: "Degraded", className: "bg-warning/15 text-warning", icon: AlertTriangle },
  outage: { label: "Outage", className: "bg-destructive/15 text-destructive", icon: XCircle },
};

const levelConfig = {
  error: { label: "Error", className: "bg-destructive/15 text-destructive" },
  warning: { label: "Warning", className: "bg-warning/15 text-warning" },
};

const System = () => {
  return (
    <AdminAppShell>
      <PageContainer
        title="System Health"
        subtitle="Monitor system health, performance, and infrastructure"
        actions={
          <Button variant="outline" size="icon">
            <RefreshCw className="h-4 w-4" />
          </Button>
        }
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          {/* Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {services.map((service, index) => {
              const StatusIcon = statusConfig[service.status].icon;
              return (
                <motion.div
                  key={service.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="border-border/50">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-admin-accent/10 flex items-center justify-center">
                            <service.icon className="h-5 w-5 text-admin-accent" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{service.name}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              Uptime: {service.uptime} • Latency: {service.latency}
                            </p>
                          </div>
                        </div>
                        <Badge
                          variant="secondary"
                          className={cn("gap-1", statusConfig[service.status].className)}
                        >
                          <StatusIcon className="h-3 w-3" />
                          {statusConfig[service.status].label}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {/* Recent Errors */}
          <Card className="border-border/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Recent Errors</CardTitle>
                  <CardDescription>Last system errors and warnings</CardDescription>
                </div>
                <Badge variant="outline" className="text-muted-foreground">
                  {recentErrors.length} entries
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border border-border/50 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30 hover:bg-muted/30">
                      <TableHead className="w-[160px]">Time</TableHead>
                      <TableHead className="w-[80px]">Level</TableHead>
                      <TableHead className="w-[100px]">Source</TableHead>
                      <TableHead>Message</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentErrors.map((log, index) => (
                      <motion.tr
                        key={log.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.02 }}
                        className="hover:bg-muted/30"
                      >
                        <TableCell className="text-muted-foreground font-mono text-xs">
                          {log.time}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={levelConfig[log.level].className}>
                            {levelConfig[log.level].label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-foreground">{log.source}</span>
                        </TableCell>
                        <TableCell className="font-mono text-xs text-foreground">
                          {log.message}
                        </TableCell>
                      </motion.tr>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </PageContainer>
    </AdminAppShell>
  );
};

export default System;
