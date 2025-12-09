import { useState } from "react";
import { motion } from "framer-motion";
import { OrgAppShell } from "@/components/layout/OrgAppShell";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Search, Calendar as CalendarIcon, Download, RefreshCw, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface LogEntry {
  id: string;
  time: string;
  level: "info" | "warn" | "error";
  source: "agent" | "db" | "telephony" | "api" | "worker";
  message: string;
}

const mockLogs: LogEntry[] = [
  { id: "1", time: "Today 3:45:23 PM", level: "info", source: "agent", message: "Agent 'Renewal Assistant' completed call successfully" },
  { id: "2", time: "Today 3:44:12 PM", level: "warn", source: "telephony", message: "High latency detected on outbound calls (>200ms)" },
  { id: "3", time: "Today 3:43:05 PM", level: "error", source: "db", message: "Connection pool exhausted, retrying..." },
  { id: "4", time: "Today 3:42:18 PM", level: "info", source: "api", message: "Webhook delivered to https://api.client.com/callback" },
  { id: "5", time: "Today 3:41:30 PM", level: "info", source: "worker", message: "Background job 'sync_contacts' completed in 2.3s" },
  { id: "6", time: "Today 3:40:45 PM", level: "warn", source: "agent", message: "Agent 'Lead Qualifier' response time exceeded threshold" },
  { id: "7", time: "Today 3:39:22 PM", level: "info", source: "telephony", message: "New SIP trunk registered: trunk-west-1" },
  { id: "8", time: "Today 3:38:10 PM", level: "error", source: "api", message: "Rate limit exceeded for client API key ***abc123" },
  { id: "9", time: "Today 3:37:05 PM", level: "info", source: "db", message: "Database backup completed successfully" },
  { id: "10", time: "Today 3:35:48 PM", level: "warn", source: "worker", message: "Job queue depth exceeding normal levels (>100 pending)" },
];

const levelConfig = {
  info: { label: "Info", className: "bg-primary/15 text-primary" },
  warn: { label: "Warning", className: "bg-warning/15 text-warning" },
  error: { label: "Error", className: "bg-destructive/15 text-destructive" },
};

const sourceConfig = {
  agent: { label: "Agent", className: "bg-primary/10 text-primary" },
  db: { label: "Database", className: "bg-success/10 text-success" },
  telephony: { label: "Telephony", className: "bg-warning/10 text-warning" },
  api: { label: "API", className: "bg-muted text-muted-foreground" },
  worker: { label: "Worker", className: "bg-info/10 text-info" },
};

const SystemLogs = () => {
  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [date, setDate] = useState<Date>();

  const filteredLogs = mockLogs.filter((log) => {
    if (search && !log.message.toLowerCase().includes(search.toLowerCase())) return false;
    if (levelFilter !== "all" && log.level !== levelFilter) return false;
    if (sourceFilter !== "all" && log.source !== sourceFilter) return false;
    return true;
  });

  return (
    <OrgAppShell>
      <PageContainer
        title="System Logs"
        subtitle="Internal system events and diagnostics"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Button variant="ghost" asChild>
              <Link to="/app/settings">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Settings
              </Link>
            </Button>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon">
                <RefreshCw className="h-4 w-4" />
              </Button>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search logs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={levelFilter} onValueChange={setLevelFilter}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="info">Info</SelectItem>
                <SelectItem value="warn">Warning</SelectItem>
                <SelectItem value="error">Error</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sourceFilter} onValueChange={setSourceFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                <SelectItem value="agent">Agent</SelectItem>
                <SelectItem value="db">Database</SelectItem>
                <SelectItem value="telephony">Telephony</SelectItem>
                <SelectItem value="api">API</SelectItem>
                <SelectItem value="worker">Worker</SelectItem>
              </SelectContent>
            </Select>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <CalendarIcon className="h-4 w-4" />
                  {date ? format(date, "PP") : "Date Range"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Table */}
          <div className="bg-card rounded-xl border border-border/50 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-border/50 hover:bg-transparent">
                  <TableHead className="text-muted-foreground font-medium w-[180px]">Time</TableHead>
                  <TableHead className="text-muted-foreground font-medium w-[100px]">Level</TableHead>
                  <TableHead className="text-muted-foreground font-medium w-[120px]">Source</TableHead>
                  <TableHead className="text-muted-foreground font-medium">Message</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log, index) => (
                  <motion.tr
                    key={log.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.02 }}
                    className="border-border/50 hover:bg-muted/30"
                  >
                    <TableCell className="text-muted-foreground font-mono text-sm">
                      {log.time}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={levelConfig[log.level].className}>
                        {levelConfig[log.level].label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn("text-xs", sourceConfig[log.source].className)}>
                        {sourceConfig[log.source].label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-foreground font-mono text-sm">
                      {log.message}
                    </TableCell>
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
          </div>
        </motion.div>
      </PageContainer>
    </OrgAppShell>
  );
};

export default SystemLogs;
