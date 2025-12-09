import { AdminAppShell } from "@/components/layout/AdminAppShell";
import { PageContainer } from "@/components/layout/PageContainer";
import { motion } from "framer-motion";
import { Activity, Server, Database, Cpu, HardDrive } from "lucide-react";

const System = () => {
  const services = [
    { name: "API Gateway", status: "Operational", uptime: "99.99%", latency: "12ms" },
    { name: "Database Cluster", status: "Operational", uptime: "99.97%", latency: "8ms" },
    { name: "AI Processing", status: "Operational", uptime: "99.95%", latency: "145ms" },
    { name: "Telephony Provider", status: "Operational", uptime: "99.92%", latency: "34ms" },
    { name: "Storage Service", status: "Operational", uptime: "99.99%", latency: "18ms" },
  ];

  return (
    <AdminAppShell>
      <PageContainer
        title="System"
        subtitle="Monitor system health, performance, and infrastructure"
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "CPU Usage", value: "34%", icon: Cpu },
            { label: "Memory", value: "62%", icon: Server },
            { label: "Storage", value: "48%", icon: HardDrive },
            { label: "DB Connections", value: "127", icon: Database },
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
          className="bg-card rounded-xl border border-border/50 p-6"
        >
          <h3 className="text-base font-semibold text-foreground mb-4">Service Status</h3>
          <div className="space-y-3">
            {services.map((service, i) => (
              <motion.div
                key={service.name}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 + i * 0.05 }}
                className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <Activity className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-foreground text-sm">{service.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Uptime: {service.uptime} • Latency: {service.latency}
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600">
                  {service.status}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </PageContainer>
    </AdminAppShell>
  );
};

export default System;
