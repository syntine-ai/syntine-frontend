import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LucideIcon, Settings, Zap, Webhook, Phone, Link2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface IntegrationCardProps {
  name: string;
  description: string;
  status: "connected" | "not_configured" | "error";
  buttonLabel: string;
  icon?: LucideIcon;
  delay?: number;
}

const statusConfig = {
  connected: {
    label: "Connected",
    className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  },
  not_configured: {
    label: "Not Configured",
    className: "bg-muted text-muted-foreground border-border",
  },
  error: {
    label: "Error",
    className: "bg-destructive/10 text-destructive border-destructive/20",
  },
};

const iconMap: Record<string, LucideIcon> = {
  exotel: Phone,
  n8n: Zap,
  webhooks: Webhook,
  default: Link2,
};

export const IntegrationCard = ({
  name,
  description,
  status,
  buttonLabel,
  icon,
  delay = 0,
}: IntegrationCardProps) => {
  const { toast } = useToast();
  const config = statusConfig[status];
  const IconComponent = icon || iconMap[name.toLowerCase()] || iconMap.default;

  const handleConfigure = () => {
    toast({
      title: `${name} Configuration`,
      description: `Opening ${name} configuration (mock).`,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      whileHover={{ y: -2 }}
      className="bg-card rounded-xl border border-border/50 p-5 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="h-11 w-11 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <IconComponent className="h-5 w-5 text-primary" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-foreground">{name}</h4>
              <Badge variant="outline" className={config.className}>
                {config.label}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
        <Button
          variant={status === "connected" ? "outline" : "default"}
          size="sm"
          onClick={handleConfigure}
        >
          {status === "connected" ? <Settings className="h-4 w-4 mr-1.5" /> : null}
          {buttonLabel}
        </Button>
      </div>
    </motion.div>
  );
};
