import { motion } from "framer-motion";
import { AdminAppShell } from "@/components/layout/AdminAppShell";
import { PageContainer } from "@/components/layout/PageContainer";
import { AdminMetricCard } from "@/components/admin/AdminMetricCard";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Building2, CreditCard, DollarSign, Users, TrendingUp } from "lucide-react";
import { format, addDays } from "date-fns";

interface Subscription {
  id: string;
  organization: string;
  plan: "starter" | "pro" | "enterprise";
  seats: number;
  status: "active" | "past_due" | "canceled" | "trialing";
  renewalDate: Date;
}

const mockSubscriptions: Subscription[] = [
  { id: "sub_1", organization: "Acme Corporation", plan: "enterprise", seats: 25, status: "active", renewalDate: addDays(new Date(), 12) },
  { id: "sub_2", organization: "TechStart Inc", plan: "pro", seats: 10, status: "active", renewalDate: addDays(new Date(), 5) },
  { id: "sub_3", organization: "Global Systems", plan: "enterprise", seats: 50, status: "active", renewalDate: addDays(new Date(), 18) },
  { id: "sub_4", organization: "Startup Labs", plan: "starter", seats: 3, status: "trialing", renewalDate: addDays(new Date(), 7) },
  { id: "sub_5", organization: "Innovation Co", plan: "pro", seats: 8, status: "past_due", renewalDate: addDays(new Date(), -3) },
  { id: "sub_6", organization: "FinanceFirst Ltd", plan: "enterprise", seats: 40, status: "active", renewalDate: addDays(new Date(), 3) },
  { id: "sub_7", organization: "HealthTech Pro", plan: "pro", seats: 15, status: "canceled", renewalDate: addDays(new Date(), -30) },
  { id: "sub_8", organization: "EduLearn Platform", plan: "starter", seats: 5, status: "trialing", renewalDate: addDays(new Date(), 14) },
  { id: "sub_9", organization: "RetailMax", plan: "pro", seats: 12, status: "active", renewalDate: addDays(new Date(), 22) },
  { id: "sub_10", organization: "CloudServe", plan: "enterprise", seats: 30, status: "active", renewalDate: addDays(new Date(), 8) },
];

const planConfig = {
  starter: { label: "Starter", className: "bg-muted text-muted-foreground" },
  pro: { label: "Pro", className: "bg-primary/15 text-primary" },
  enterprise: { label: "Enterprise", className: "bg-admin-accent/15 text-admin-accent" },
};

const statusConfig = {
  active: { label: "Active", className: "bg-success/15 text-success" },
  past_due: { label: "Past Due", className: "bg-warning/15 text-warning" },
  canceled: { label: "Canceled", className: "bg-destructive/15 text-destructive" },
  trialing: { label: "Trial", className: "bg-primary/15 text-primary" },
};

const Subscriptions = () => {
  return (
    <AdminAppShell>
      <PageContainer
        title="Subscriptions"
        subtitle="Manage organization billing and subscription plans"
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <AdminMetricCard
              title="Total Organizations"
              value="42"
              trend="+5.1%"
              icon={Building2}
            />
            <AdminMetricCard
              title="Active Subscriptions"
              value="38"
              trend="+3.4%"
              icon={CreditCard}
            />
            <AdminMetricCard
              title="MRR"
              value="$24,580"
              trend="+8.2%"
              icon={DollarSign}
            />
            <AdminMetricCard
              title="Trial Organizations"
              value="4"
              trend="+2"
              icon={Users}
            />
          </div>

          {/* Subscriptions Table */}
          <div className="bg-card rounded-xl border border-border/50 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30 hover:bg-muted/30">
                  <TableHead>Organization</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead className="text-right">Seats</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Renewal Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockSubscriptions.map((sub, index) => (
                  <motion.tr
                    key={sub.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.03 }}
                    className="hover:bg-muted/30"
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-admin-accent/10 flex items-center justify-center">
                          <Building2 className="h-4 w-4 text-admin-accent" />
                        </div>
                        <span className="font-medium text-foreground">{sub.organization}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={planConfig[sub.plan].className}>
                        {planConfig[sub.plan].label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">{sub.seats}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={statusConfig[sub.status].className}>
                        {statusConfig[sub.status].label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {format(sub.renewalDate, "MMM dd, yyyy")}
                    </TableCell>
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
          </div>
        </motion.div>
      </PageContainer>
    </AdminAppShell>
  );
};

export default Subscriptions;
