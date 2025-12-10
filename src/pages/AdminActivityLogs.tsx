import { useState } from "react";
import { motion } from "framer-motion";
import { AdminAppShell } from "@/components/layout/AdminAppShell";
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
import { Search, RefreshCw, User, Settings, Database, Shield } from "lucide-react";

interface ActivityLog {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  resource: string;
  category: "auth" | "data" | "config" | "admin";
  ip: string;
}

const mockLogs: ActivityLog[] = [
  { id: "1", timestamp: "2024-01-15 14:32:05", actor: "admin@syntine.io", action: "Updated organization settings", resource: "Acme Corporation", category: "config", ip: "192.168.1.100" },
  { id: "2", timestamp: "2024-01-15 14:28:12", actor: "john@acme.com", action: "User login", resource: "Session", category: "auth", ip: "10.0.0.45" },
  { id: "3", timestamp: "2024-01-15 14:25:33", actor: "system", action: "Database backup completed", resource: "PostgreSQL", category: "data", ip: "—" },
  { id: "4", timestamp: "2024-01-15 14:20:18", actor: "admin@syntine.io", action: "Suspended organization", resource: "HealthTech Pro", category: "admin", ip: "192.168.1.100" },
  { id: "5", timestamp: "2024-01-15 14:15:42", actor: "sarah@techstart.io", action: "Created new campaign", resource: "TechStart Inc", category: "data", ip: "172.16.0.22" },
  { id: "6", timestamp: "2024-01-15 14:10:05", actor: "admin@syntine.io", action: "Updated subscription plan", resource: "Global Systems", category: "admin", ip: "192.168.1.100" },
  { id: "7", timestamp: "2024-01-15 14:05:28", actor: "mike@globalsys.com", action: "User logout", resource: "Session", category: "auth", ip: "10.10.10.15" },
  { id: "8", timestamp: "2024-01-15 14:00:15", actor: "system", action: "Scheduled job executed", resource: "Worker Queue", category: "data", ip: "—" },
];

const categoryConfig = {
  auth: { label: "Auth", icon: User, className: "bg-primary/15 text-primary" },
  data: { label: "Data", icon: Database, className: "bg-success/15 text-success" },
  config: { label: "Config", icon: Settings, className: "bg-warning/15 text-warning" },
  admin: { label: "Admin", icon: Shield, className: "bg-destructive/15 text-destructive" },
};

const AdminActivityLogs = () => {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const filteredLogs = mockLogs.filter((log) => {
    const matchesSearch =
      log.actor.toLowerCase().includes(search.toLowerCase()) ||
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.resource.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === "all" || log.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <AdminAppShell>
      <PageContainer
        title="Activity Logs"
        subtitle="Monitor platform-wide activity and audit trail"
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
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[220px] max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search logs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="auth">Auth</SelectItem>
                <SelectItem value="data">Data</SelectItem>
                <SelectItem value="config">Config</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Logs Table */}
          <div className="bg-card rounded-xl border border-border/50 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30 hover:bg-muted/30">
                  <TableHead className="w-[160px]">Timestamp</TableHead>
                  <TableHead>Actor</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Resource</TableHead>
                  <TableHead className="w-[100px]">Category</TableHead>
                  <TableHead className="w-[120px]">IP Address</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log, index) => {
                  const config = categoryConfig[log.category];
                  const CategoryIcon = config.icon;
                  return (
                    <motion.tr
                      key={log.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.03 }}
                      className="hover:bg-muted/30"
                    >
                      <TableCell className="text-muted-foreground font-mono text-xs">
                        {log.timestamp}
                      </TableCell>
                      <TableCell className="font-medium text-foreground">
                        {log.actor}
                      </TableCell>
                      <TableCell className="text-foreground">
                        {log.action}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {log.resource}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={`gap-1 ${config.className}`}>
                          <CategoryIcon className="h-3 w-3" />
                          {config.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                          {log.ip}
                        </code>
                      </TableCell>
                    </motion.tr>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </motion.div>
      </PageContainer>
    </AdminAppShell>
  );
};

export default AdminActivityLogs;
