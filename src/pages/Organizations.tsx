import { AdminAppShell } from "@/components/layout/AdminAppShell";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusPill } from "@/components/shared/StatusPill";
import { Plus, Search, Building, Users, MoreVertical } from "lucide-react";
import { motion } from "framer-motion";

const organizations = [
  { id: 1, name: "Acme Corporation", plan: "Enterprise", users: 45, status: "active" as const, revenue: "$4,500/mo" },
  { id: 2, name: "TechStart Inc", plan: "Pro", users: 12, status: "active" as const, revenue: "$990/mo" },
  { id: 3, name: "Global Systems", plan: "Enterprise", users: 78, status: "active" as const, revenue: "$7,800/mo" },
  { id: 4, name: "Startup Labs", plan: "Starter", users: 3, status: "inactive" as const, revenue: "$0/mo" },
  { id: 5, name: "Innovation Co", plan: "Pro", users: 8, status: "active" as const, revenue: "$660/mo" },
];

const Organizations = () => {
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
        {/* Search */}
        <div className="relative max-w-md mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search organizations..." className="pl-9" />
        </div>

        {/* Organizations Table */}
        <div className="bg-card rounded-lg shadow-card border border-border/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-secondary/30">
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Organization</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Plan</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Users</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Revenue</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground"></th>
                </tr>
              </thead>
              <tbody>
                {organizations.map((org, i) => (
                  <motion.tr
                    key={org.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-b border-border/50 last:border-0 hover:bg-secondary/20 transition-colors cursor-pointer"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-admin-accent/10 flex items-center justify-center">
                          <Building className="h-5 w-5 text-admin-accent" />
                        </div>
                        <span className="font-medium text-foreground">{org.name}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                        {org.plan}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="text-foreground">{org.users}</span>
                      </div>
                    </td>
                    <td className="p-4 text-foreground font-medium">{org.revenue}</td>
                    <td className="p-4">
                      <StatusPill status={org.status} />
                    </td>
                    <td className="p-4">
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </PageContainer>
    </AdminAppShell>
  );
};

export default Organizations;
