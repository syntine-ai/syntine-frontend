import { useState } from "react";
import { motion } from "framer-motion";
import { AdminAppShell } from "@/components/layout/AdminAppShell";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, User, Monitor, Smartphone, RefreshCw, LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Session {
  id: string;
  user: string;
  email: string;
  organization: string;
  lastSeen: string;
  ip: string;
  device: "desktop" | "mobile" | "tablet";
  browser: string;
  status: "active" | "idle" | "expired";
}

const mockSessions: Session[] = [
  { id: "sess_1", user: "John Smith", email: "john@acme.com", organization: "Acme Corporation", lastSeen: "2 min ago", ip: "192.168.1.100", device: "desktop", browser: "Chrome 120", status: "active" },
  { id: "sess_2", user: "Sarah Johnson", email: "sarah@techstart.io", organization: "TechStart Inc", lastSeen: "5 min ago", ip: "10.0.0.45", device: "desktop", browser: "Safari 17", status: "active" },
  { id: "sess_3", user: "Mike Brown", email: "mike@globalsys.com", organization: "Global Systems", lastSeen: "12 min ago", ip: "172.16.0.22", device: "mobile", browser: "Safari iOS", status: "idle" },
  { id: "sess_4", user: "Emily Davis", email: "emily@startuplabs.co", organization: "Startup Labs", lastSeen: "1 hour ago", ip: "192.168.2.50", device: "desktop", browser: "Firefox 121", status: "idle" },
  { id: "sess_5", user: "Chris Wilson", email: "chris@innovate.io", organization: "Innovation Co", lastSeen: "3 min ago", ip: "10.10.10.15", device: "tablet", browser: "Chrome iPad", status: "active" },
  { id: "sess_6", user: "Lisa Anderson", email: "lisa@financefirst.com", organization: "FinanceFirst Ltd", lastSeen: "8 min ago", ip: "192.168.0.101", device: "desktop", browser: "Edge 120", status: "active" },
  { id: "sess_7", user: "David Lee", email: "david@healthtech.pro", organization: "HealthTech Pro", lastSeen: "2 hours ago", ip: "172.20.0.88", device: "mobile", browser: "Chrome Android", status: "expired" },
  { id: "sess_8", user: "Amy Chen", email: "amy@edulearn.com", organization: "EduLearn Platform", lastSeen: "20 min ago", ip: "10.0.1.200", device: "desktop", browser: "Chrome 120", status: "idle" },
];

const statusConfig = {
  active: { label: "Active", className: "bg-success/15 text-success" },
  idle: { label: "Idle", className: "bg-warning/15 text-warning" },
  expired: { label: "Expired", className: "bg-muted text-muted-foreground" },
};

const deviceIcons = {
  desktop: Monitor,
  mobile: Smartphone,
  tablet: Monitor,
};

const Sessions = () => {
  const [search, setSearch] = useState("");
  const { toast } = useToast();

  const filteredSessions = mockSessions.filter((session) => {
    if (!search) return true;
    return (
      session.user.toLowerCase().includes(search.toLowerCase()) ||
      session.organization.toLowerCase().includes(search.toLowerCase()) ||
      session.email.toLowerCase().includes(search.toLowerCase())
    );
  });

  const handleTerminate = (session: Session) => {
    toast({
      title: "Session terminated",
      description: `Session for ${session.user} has been terminated.`,
    });
  };

  return (
    <AdminAppShell>
      <PageContainer
        title="Sessions"
        subtitle="Monitor active user sessions across all organizations"
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          {/* Filters */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by user, email, or organization..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button variant="outline" size="icon">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>

          {/* Sessions Table */}
          <div className="bg-card rounded-xl border border-border/50 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30 hover:bg-muted/30">
                  <TableHead>User</TableHead>
                  <TableHead>Organization</TableHead>
                  <TableHead>Last Seen</TableHead>
                  <TableHead>IP Address</TableHead>
                  <TableHead>Device</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[80px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSessions.map((session, index) => {
                  const DeviceIcon = deviceIcons[session.device];
                  return (
                    <motion.tr
                      key={session.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.03 }}
                      className="hover:bg-muted/30"
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{session.user}</p>
                            <p className="text-xs text-muted-foreground">{session.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{session.organization}</TableCell>
                      <TableCell className="text-muted-foreground">{session.lastSeen}</TableCell>
                      <TableCell>
                        <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{session.ip}</code>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <DeviceIcon className="h-4 w-4" />
                          <span className="text-sm">{session.browser}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={statusConfig[session.status].className}>
                          {statusConfig[session.status].label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => handleTerminate(session)}
                          disabled={session.status === "expired"}
                        >
                          <LogOut className="h-4 w-4" />
                        </Button>
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

export default Sessions;
