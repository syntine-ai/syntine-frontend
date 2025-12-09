import { AdminAppShell } from "@/components/layout/AdminAppShell";
import { PageContainer } from "@/components/layout/PageContainer";
import { FilterChip, FilterChipGroup } from "@/components/shared/FilterChip";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, AlertCircle, Info, AlertTriangle, CheckCircle, ChevronDown, ChevronUp, RefreshCw, Download } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface LogEntry {
  id: number;
  level: "error" | "warning" | "info" | "success";
  message: string;
  timestamp: string;
  source: string;
  requestId: string;
  details: string;
}

const logs: LogEntry[] = [
  {
    id: 1,
    level: "error",
    message: "API rate limit exceeded for org:acme-corp",
    timestamp: "2024-01-15 14:32:18",
    source: "api-gateway",
    requestId: "req_xK9mN2pQ",
    details: "Rate limit: 1000 req/min exceeded. Current: 1247 requests. Client IP: 192.168.1.105. Endpoint: /api/v1/calls",
  },
  {
    id: 2,
    level: "warning",
    message: "High memory usage detected on worker-node-3",
    timestamp: "2024-01-15 14:30:45",
    source: "monitoring",
    requestId: "mon_aB4cD6eF",
    details: "Memory usage at 87%. Threshold: 80%. Recommended action: Scale horizontally or restart service.",
  },
  {
    id: 3,
    level: "info",
    message: "New organization created: TechStart Inc",
    timestamp: "2024-01-15 14:28:12",
    source: "auth-service",
    requestId: "req_7gH8iJ9k",
    details: "Organization ID: org_ts_001. Admin email: admin@techstart.io. Plan: Professional.",
  },
  {
    id: 4,
    level: "success",
    message: "Database backup completed successfully",
    timestamp: "2024-01-15 14:25:00",
    source: "db-cluster",
    requestId: "bkp_L0mN1oP2",
    details: "Backup size: 4.2 GB. Duration: 3m 42s. Destination: s3://backups/daily/2024-01-15.sql.gz",
  },
  {
    id: 5,
    level: "error",
    message: "Failed to send email: SMTP connection timeout",
    timestamp: "2024-01-15 14:22:33",
    source: "email-service",
    requestId: "req_qR3sT4uV",
    details: "Recipient: user@example.com. Template: password_reset. SMTP server: smtp.provider.io:587. Timeout after 30s.",
  },
  {
    id: 6,
    level: "info",
    message: "User login: admin@syntine.io",
    timestamp: "2024-01-15 14:20:00",
    source: "auth-service",
    requestId: "req_5wX6yZ7a",
    details: "IP: 103.42.15.89. Device: Chrome 120 / macOS. Location: Mumbai, IN. MFA: Verified.",
  },
  {
    id: 7,
    level: "warning",
    message: "Telephony provider latency spike detected",
    timestamp: "2024-01-15 14:18:22",
    source: "telephony",
    requestId: "tel_bC8dE9fG",
    details: "Average latency: 892ms (normal: <200ms). Affected calls: 23. Provider: Twilio. Region: ap-south-1.",
  },
  {
    id: 8,
    level: "success",
    message: "Campaign 'Q1 Renewal' completed",
    timestamp: "2024-01-15 14:15:00",
    source: "campaign-engine",
    requestId: "cmp_hI0jK1lM",
    details: "Total calls: 1,284. Answered: 864 (67.3%). Duration: 4h 32m. Agent: Renewal Assistant.",
  },
];

const levelConfig = {
  error: { icon: AlertCircle, color: "text-destructive", bg: "bg-destructive/10" },
  warning: { icon: AlertTriangle, color: "text-warning", bg: "bg-warning/10" },
  info: { icon: Info, color: "text-primary", bg: "bg-primary/10" },
  success: { icon: CheckCircle, color: "text-success", bg: "bg-success/10" },
};

const services = ["All Services", "api-gateway", "auth-service", "db-cluster", "email-service", "monitoring", "telephony", "campaign-engine"];
const dateRanges = ["Last hour", "Last 24 hours", "Last 7 days", "Last 30 days"];

const SystemLogs = () => {
  const [filter, setFilter] = useState("all");
  const [serviceFilter, setServiceFilter] = useState("All Services");
  const [dateRange, setDateRange] = useState("Last 24 hours");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedLog, setExpandedLog] = useState<number | null>(null);
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);
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

  const filteredLogs = logs.filter((log) => {
    const matchesLevel = filter === "all" || log.level === filter;
    const matchesService = serviceFilter === "All Services" || log.source === serviceFilter;
    const matchesSearch = searchQuery === "" || 
      log.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.requestId.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesLevel && matchesService && matchesSearch;
  });

  return (
    <AdminAppShell>
      <PageContainer
        title="System Logs"
        subtitle="Monitor system events and errors"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        }
      >
        {/* Filters */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search logs or request ID..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Select value={serviceFilter} onValueChange={setServiceFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Service" />
              </SelectTrigger>
              <SelectContent>
                {services.map((service) => (
                  <SelectItem key={service} value={service}>
                    {service}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Date range" />
              </SelectTrigger>
              <SelectContent>
                {dateRanges.map((range) => (
                  <SelectItem key={range} value={range}>
                    {range}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

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
        </div>

        {/* Logs List */}
        <div className="bg-card rounded-lg shadow-card border border-border/50 divide-y divide-border/50">
          {filteredLogs.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              No logs match your current filters.
            </div>
          ) : (
            filteredLogs.map((log, i) => {
              const config = levelConfig[log.level];
              const Icon = config.icon;
              const isExpanded = expandedLog === log.id;

              return (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="hover:bg-secondary/20 transition-colors"
                >
                  <div
                    className="p-4 cursor-pointer"
                    onClick={() => setExpandedLog(isExpanded ? null : log.id)}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`h-8 w-8 rounded-lg ${config.bg} flex items-center justify-center flex-shrink-0`}>
                        <Icon className={`h-4 w-4 ${config.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground">{log.message}</p>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                          <span className="text-xs text-muted-foreground">{log.timestamp}</span>
                          <span className="text-xs text-muted-foreground">Source: {log.source}</span>
                          <span className="text-xs font-mono text-muted-foreground">{log.requestId}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${config.bg} ${config.color}`}>
                          {log.level.toUpperCase()}
                        </span>
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                  </div>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-4 pl-16">
                          <div className="bg-secondary/30 rounded-lg p-4 font-mono text-sm text-muted-foreground">
                            {log.details}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="mt-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedLog(log);
                            }}
                          >
                            View Full Details
                          </Button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })
          )}
        </div>

        {/* Log Detail Modal */}
        <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Log Details</DialogTitle>
            </DialogHeader>
            {selectedLog && (
              <ScrollArea className="max-h-[60vh]">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Level</p>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${levelConfig[selectedLog.level].bg} ${levelConfig[selectedLog.level].color}`}>
                        {selectedLog.level.toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Timestamp</p>
                      <p className="text-sm font-medium">{selectedLog.timestamp}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Source</p>
                      <p className="text-sm font-medium">{selectedLog.source}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Request ID</p>
                      <p className="text-sm font-mono">{selectedLog.requestId}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Message</p>
                    <p className="text-sm font-medium">{selectedLog.message}</p>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Raw Log Entry</p>
                    <div className="bg-secondary/50 rounded-lg p-4 font-mono text-xs text-muted-foreground whitespace-pre-wrap">
                      {`{
  "level": "${selectedLog.level}",
  "timestamp": "${selectedLog.timestamp}",
  "source": "${selectedLog.source}",
  "request_id": "${selectedLog.requestId}",
  "message": "${selectedLog.message}",
  "details": "${selectedLog.details}"
}`}
                    </div>
                  </div>
                </div>
              </ScrollArea>
            )}
          </DialogContent>
        </Dialog>
      </PageContainer>
    </AdminAppShell>
  );
};

export default SystemLogs;
