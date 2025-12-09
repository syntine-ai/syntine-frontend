import { OrgAppShell } from "@/components/layout/OrgAppShell";
import { PageContainer } from "@/components/layout/PageContainer";
import { motion } from "framer-motion";
import { Phone, Clock, CheckCircle, XCircle, TrendingUp } from "lucide-react";

const Calls = () => {
  return (
    <OrgAppShell>
      <PageContainer
        title="Calls"
        subtitle="View and manage all call logs and recordings"
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Calls", value: "12,847", icon: Phone, color: "primary" },
            { label: "Avg Duration", value: "3m 24s", icon: Clock, color: "primary" },
            { label: "Answered", value: "9,234", icon: CheckCircle, color: "success" },
            { label: "Failed", value: "892", icon: XCircle, color: "destructive" },
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
                <div className={`h-10 w-10 rounded-lg bg-${stat.color}/10 flex items-center justify-center`}>
                  <stat.icon className={`h-5 w-5 text-${stat.color}`} />
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
          <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Call Logs Coming Soon
          </h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            This page will display detailed call logs, recordings, transcripts, 
            and analytics for all your voice interactions.
          </p>
        </motion.div>
      </PageContainer>
    </OrgAppShell>
  );
};

export default Calls;
