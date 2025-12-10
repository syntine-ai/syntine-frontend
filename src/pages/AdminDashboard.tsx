import { motion } from "framer-motion";
import { AdminAppShell } from "@/components/layout/AdminAppShell";
import { PageContainer } from "@/components/layout/PageContainer";
import { AdminMetricCard } from "@/components/admin/AdminMetricCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  Users,
  CreditCard,
  Activity,
  TrendingUp,
  Phone,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";

const AdminDashboard = () => {
  return (
    <AdminAppShell>
      <PageContainer
        title="Admin Dashboard"
        subtitle="Platform overview and key metrics"
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <AdminMetricCard
              title="Total Organizations"
              value="42"
              trend="+5.1%"
              icon={Building2}
              delay={0}
            />
            <AdminMetricCard
              title="Active Users"
              value="1,284"
              trend="+12.3%"
              icon={Users}
              delay={0.05}
            />
            <AdminMetricCard
              title="Monthly Revenue"
              value="$48,250"
              trend="+8.7%"
              icon={CreditCard}
              delay={0.1}
            />
            <AdminMetricCard
              title="Total Calls Today"
              value="3,847"
              trend="+15.2%"
              icon={Phone}
              delay={0.15}
            />
          </div>

          {/* Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Activity className="h-4 w-4 text-primary" />
                  System Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Database</span>
                  <Badge variant="secondary" className="bg-success/15 text-success gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Operational
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">API Services</span>
                  <Badge variant="secondary" className="bg-success/15 text-success gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Operational
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Telephony</span>
                  <Badge variant="secondary" className="bg-warning/15 text-warning gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    Degraded
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  Growth Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">New Signups (7d)</span>
                  <span className="text-sm font-medium text-foreground">+24</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Trial Conversions</span>
                  <span className="text-sm font-medium text-foreground">68%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Churn Rate</span>
                  <span className="text-sm font-medium text-foreground">2.4%</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Phone className="h-4 w-4 text-primary" />
                  Call Statistics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Avg Duration</span>
                  <span className="text-sm font-medium text-foreground">4m 32s</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Success Rate</span>
                  <span className="text-sm font-medium text-foreground">94.2%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Active Agents</span>
                  <span className="text-sm font-medium text-foreground">127</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </PageContainer>
    </AdminAppShell>
  );
};

export default AdminDashboard;
