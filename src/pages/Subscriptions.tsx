import { AdminAppShell } from "@/components/layout/AdminAppShell";
import { PageContainer } from "@/components/layout/PageContainer";
import { motion } from "framer-motion";
import { CreditCard, TrendingUp, DollarSign, Users } from "lucide-react";

const Subscriptions = () => {
  return (
    <AdminAppShell>
      <PageContainer
        title="Subscriptions"
        subtitle="Manage organization billing and subscription plans"
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Active Subscriptions", value: "38", icon: CreditCard },
            { label: "Monthly Revenue", value: "$24,580", icon: DollarSign },
            { label: "Trial Users", value: "12", icon: Users },
            { label: "MRR Growth", value: "+8.4%", icon: TrendingUp },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-card rounded-xl border border-border/50 p-5"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{stat.value}</p>
                </div>
                <div className="h-10 w-10 rounded-lg bg-admin-accent/10 flex items-center justify-center">
                  <stat.icon className="h-5 w-5 text-admin-accent" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card rounded-xl border border-border/50 p-8 text-center"
        >
          <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Subscription Management Coming Soon
          </h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            This page will allow you to view and manage all organization subscriptions,
            billing history, and plan changes.
          </p>
        </motion.div>
      </PageContainer>
    </AdminAppShell>
  );
};

export default Subscriptions;
