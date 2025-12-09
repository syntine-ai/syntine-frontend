import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AdminAppShell } from "@/components/layout/AdminAppShell";
import { PageContainer } from "@/components/layout/PageContainer";
import { OrgStatusPill } from "@/components/admin/OrgStatusPill";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { motion } from "framer-motion";
import {
  Plus,
  Search,
  Building2,
  MoreVertical,
  Eye,
  UserCog,
  Ban,
  CheckCircle,
  ExternalLink,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface Organization {
  id: string;
  name: string;
  domain: string;
  plan: "starter" | "pro" | "enterprise";
  status: "active" | "trial" | "suspended";
  callsThisMonth: number;
  lastActive: Date;
}

const mockOrganizations: Organization[] = [
  { id: "org_1", name: "Acme Corporation", domain: "acme.com", plan: "enterprise", status: "active", callsThisMonth: 2840, lastActive: new Date(Date.now() - 1000 * 60 * 5) },
  { id: "org_2", name: "TechStart Inc", domain: "techstart.io", plan: "pro", status: "active", callsThisMonth: 1520, lastActive: new Date(Date.now() - 1000 * 60 * 30) },
  { id: "org_3", name: "Global Systems", domain: "globalsys.com", plan: "enterprise", status: "active", callsThisMonth: 3210, lastActive: new Date(Date.now() - 1000 * 60 * 15) },
  { id: "org_4", name: "Startup Labs", domain: "startuplabs.co", plan: "starter", status: "trial", callsThisMonth: 180, lastActive: new Date(Date.now() - 1000 * 60 * 60 * 2) },
  { id: "org_5", name: "Innovation Co", domain: "innovate.io", plan: "pro", status: "active", callsThisMonth: 920, lastActive: new Date(Date.now() - 1000 * 60 * 45) },
  { id: "org_6", name: "FinanceFirst Ltd", domain: "financefirst.com", plan: "enterprise", status: "active", callsThisMonth: 4100, lastActive: new Date(Date.now() - 1000 * 60 * 10) },
  { id: "org_7", name: "HealthTech Pro", domain: "healthtech.pro", plan: "pro", status: "suspended", callsThisMonth: 0, lastActive: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5) },
  { id: "org_8", name: "EduLearn Platform", domain: "edulearn.com", plan: "starter", status: "trial", callsThisMonth: 85, lastActive: new Date(Date.now() - 1000 * 60 * 60 * 4) },
  { id: "org_9", name: "RetailMax", domain: "retailmax.io", plan: "pro", status: "active", callsThisMonth: 1180, lastActive: new Date(Date.now() - 1000 * 60 * 20) },
  { id: "org_10", name: "CloudServe", domain: "cloudserve.net", plan: "enterprise", status: "active", callsThisMonth: 2650, lastActive: new Date(Date.now() - 1000 * 60 * 8) },
];

const planColors: Record<string, string> = {
  starter: "bg-muted text-muted-foreground",
  pro: "bg-primary/10 text-primary",
  enterprise: "bg-admin-accent/10 text-admin-accent",
};

const Organizations = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const navigate = useNavigate();
  const { toast } = useToast();

  const filteredOrgs = mockOrganizations.filter((org) => {
    const matchesSearch =
      org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      org.domain.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || org.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleImpersonate = (org: Organization) => {
    toast({
      title: "Impersonating Organization",
      description: `Opening ${org.name} workspace in a new tab (mock).`,
    });
    window.open("/dashboard", "_blank");
  };

  const handleToggleSuspend = (org: Organization) => {
    const action = org.status === "suspended" ? "activated" : "suspended";
    toast({
      title: `Organization ${action}`,
      description: `${org.name} has been ${action} (mock).`,
    });
  };

  return (
    <AdminAppShell>
      <PageContainer
        title="Organizations"
        subtitle="Manage all registered organizations"
        actions={
          <Button className="gap-2 bg-admin-accent hover:bg-admin-accent/90">
            <Plus className="h-4 w-4" />
            Add Organization
          </Button>
        }
      >
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="relative flex-1 min-w-[220px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search organizations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="trial">Trial</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Organizations Table */}
        <div className="bg-card rounded-xl border border-border/50 overflow-hidden shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30">
                <TableHead className="w-[250px]">Organization</TableHead>
                <TableHead>Domain</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Calls This Month</TableHead>
                <TableHead>Last Active</TableHead>
                <TableHead className="w-[80px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrgs.map((org, index) => (
                <motion.tr
                  key={org.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.03 }}
                  className="group hover:bg-muted/30 cursor-pointer transition-colors"
                  onClick={() => navigate(`/admin/organizations/${org.id}`)}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-lg bg-admin-accent/10 flex items-center justify-center">
                        <Building2 className="h-4 w-4 text-admin-accent" />
                      </div>
                      <span className="font-medium text-foreground">
                        {org.name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {org.domain}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${
                        planColors[org.plan]
                      }`}
                    >
                      {org.plan}
                    </span>
                  </TableCell>
                  <TableCell>
                    <OrgStatusPill status={org.status} />
                  </TableCell>
                  <TableCell className="text-right font-medium text-foreground">
                    {org.callsThisMonth.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {format(org.lastActive, "MMM dd, HH:mm")}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/admin/organizations/${org.id}`);
                          }}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            handleImpersonate(org);
                          }}
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Impersonate
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => e.stopPropagation()}
                        >
                          <UserCog className="h-4 w-4 mr-2" />
                          Change Plan
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleSuspend(org);
                          }}
                          className={
                            org.status === "suspended"
                              ? "text-emerald-600"
                              : "text-destructive"
                          }
                        >
                          {org.status === "suspended" ? (
                            <>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Activate
                            </>
                          ) : (
                            <>
                              <Ban className="h-4 w-4 mr-2" />
                              Suspend
                            </>
                          )}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </motion.tr>
              ))}
            </TableBody>
          </Table>
        </div>
      </PageContainer>
    </AdminAppShell>
  );
};

export default Organizations;
