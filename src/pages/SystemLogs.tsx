import { AdminAppShell } from "@/components/layout/AdminAppShell";
import { PageContainer } from "@/components/layout/PageContainer";
import { FilterChip, FilterChipGroup } from "@/components/shared/FilterChip";
import { Input } from "@/components/ui/input";
import { Search, AlertCircle, Info, AlertTriangle, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

const logs = [
  { id: 1, level: "error", message: "API rate limit exceeded for org:acme-corp", timestamp: "2024-01-15 14:32:18", source: "api-gateway" },
  { id: 2, level: "warning", message: "High memory usage detected on worker-node-3", timestamp: "2024-01-15 14:30:45", source: "monitoring" },
  { id: 3, level: "info", message: "New organization created: TechStart Inc", timestamp: "2024-01-15 14:28:12", source: "auth-service" },
  { id: 4, level: "success", message: "Database backup completed successfully", timestamp: "2024-01-15 14:25:00", source: "db-cluster" },
  { id: 5, level: "error", message: "Failed to send email: SMTP connection timeout", timestamp: "2024-01-15 14:22:33", source: "email-service" },
  { id: 6, level: "info", message: "User login: admin@syntine.io", timestamp: "2024-01-15 14:20:00", source: "auth-service" },
];

const levelConfig = {
  error: { icon: AlertCircle, color: "text-destructive", bg: "bg-destructive/10" },
  warning: { icon: AlertTriangle, color: "text-warning", bg: "bg-warning/10" },
  info: { icon: Info, color: "text-primary", bg: "bg-primary/10" },
  success: { icon: CheckCircle, color: "text-success", bg: "bg-success/10" },
};

const SystemLogs = () => {
  const [filter, setFilter] = useState("all");

  return (
    <AdminAppShell>
      <PageContainer
        title="System Logs"
        subtitle="Monitor system events and errors"
      >
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search logs..." className="pl-9" />
          </div>
          <FilterChipGroup>
            {["all", "error", "warning", "info", "success"].map((level) => (
              <FilterChip
                key={level}
                label={level.charAt(0).toUpperCase() + level.slice(1)}
                isActive={filter === level}
                onToggle={() => setFilter(level)}
              />
            ))}
          </FilterChipGroup>
        </div>

        {/* Logs List */}
        <div className="bg-card rounded-lg shadow-card border border-border/50 divide-y divide-border/50">
          {logs.map((log, i) => {
            const config = levelConfig[log.level as keyof typeof levelConfig];
            const Icon = config.icon;

            return (
              <motion.div
                key={log.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.03 }}
                className="p-4 hover:bg-secondary/20 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className={`h-8 w-8 rounded-lg ${config.bg} flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`h-4 w-4 ${config.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground">{log.message}</p>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-xs text-muted-foreground">{log.timestamp}</span>
                      <span className="text-xs text-muted-foreground">Source: {log.source}</span>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${config.bg} ${config.color}`}>
                    {log.level.toUpperCase()}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </PageContainer>
    </AdminAppShell>
  );
};

export default SystemLogs;
