import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AdminAppShell } from "@/components/layout/AdminAppShell";
import { PageContainer } from "@/components/layout/PageContainer";
import { OrgStatusPill } from "@/components/admin/OrgStatusPill";
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
  ExternalLink,
  Ban,
  CheckCircle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format, addDays } from "date-fns";

interface Organization {
  id: string;
  name: string;
  domain: string;
  plan: "starter" | "pro" | "enterprise";
  status: "active" | "trial" | "suspended";
  activeCampaigns: number;
  nextBillingDate: Date;
}

const mockOrganizations: Organization[] = [
  { id: "org_1", name: "Acme Corporation", domain: "acme.com", plan: "enterprise", status: "active", activeCampaigns: 5, nextBillingDate: addDays(new Date(), 12) },
  { id: "org_2", name: "TechStart Inc", domain: "techstart.io", plan: "pro", status: "active", activeCampaigns: 3, nextBillingDate: addDays(new Date(), 5) },
  { id: "org_3", name: "Global Systems", domain: "globalsys.com", plan: "enterprise", status: "active", activeCampaigns: 8, nextBillingDate: addDays(new Date(), 18) },
  { id: "org_4", name: "Startup Labs", domain: "startuplabs.co", plan: "starter", status: "trial", activeCampaigns: 1, nextBillingDate: addDays(new Date(), 7) },
  { id: "org_5", name: "Innovation Co", domain: "innovate.io", plan: "pro", status: "active", activeCampaigns: 2, nextBillingDate: addDays(new Date(), 22) },
  { id: "org_6", name: "FinanceFirst Ltd", domain: "financefirst.com", plan: "enterprise", status: "active", activeCampaigns: 12, nextBillingDate: addDays(new Date(), 3) },
  { id: "org_7", name: "HealthTech Pro", domain: "healthtech.pro", plan: "pro", status: "suspended", activeCampaigns: 0, nextBillingDate: addDays(new Date(), -5) },
  { id: "org_8", name: "EduLearn Platform", domain: "edulearn.com", plan: "starter", status: "trial", activeCampaigns: 1, nextBillingDate: addDays(new Date(), 14) },
];

const planConfig = {
  starter: { label: "Starter", className: "bg-muted text-muted-foreground" },
  pro: { label: "Pro", className: "bg-primary/15 text-primary" },
  enterprise: { label: "Enterprise", className: "bg-admin-accent/15 text-admin-accent" },
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
    const matchesStatus = statusFilter === "all" || org.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleImpersonate = (org: Organization) => {
    toast({
      title: "Impersonating Organization",
      description: `Opening ${org.name} workspace in a new tab (mock).`,
    });
    window.open("/app/dashboard", "_blank");
  };

  const handleToggleSuspend = (org: Organization) => {
    const action = org.status === "suspended" ? "activated" : "suspended";
    toast({
      title: `Organization ${action}`,
      description: `${org.name} has been ${action}.`,
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
            New Organization
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
        <div className="bg-card rounded-xl border border-border/50 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30">
                <TableHead>Organization</TableHead>
                <TableHead>Domain</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead className="text-right">Active Campaigns</TableHead>
                <TableHead>Next Billing</TableHead>
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
                  className="group hover:bg-muted/30 cursor-pointer"
                  onClick={() => navigate(`/admin/organizations/${org.id}`)}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-lg bg-admin-accent/10 flex items-center justify-center">
                        <Building2 className="h-4 w-4 text-admin-accent" />
                      </div>
                      <span className="font-medium text-foreground">{org.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{org.domain}</TableCell>
                  <TableCell>
                    <OrgStatusPill status={org.status} />
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={planConfig[org.plan].className}>
                      {planConfig[org.plan].label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium">{org.activeCampaigns}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {format(org.nextBillingDate, "MMM dd, yyyy")}
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
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); navigate(`/admin/organizations/${org.id}`); }}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleImpersonate(org); }}>
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Impersonate
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={(e) => { e.stopPropagation(); handleToggleSuspend(org); }}
                          className={org.status === "suspended" ? "text-success" : "text-destructive"}
                        >
                          {org.status === "suspended" ? (
                            <><CheckCircle className="h-4 w-4 mr-2" />Activate</>
                          ) : (
                            <><Ban className="h-4 w-4 mr-2" />Suspend</>
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
