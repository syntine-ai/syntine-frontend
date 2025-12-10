import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface EventMetadata {
  user?: string;
  org?: string;
  system?: string;
  ip?: string;
  [key: string]: string | undefined;
}

interface AdminActivityEventCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  time: string;
  type: "organization" | "billing" | "system" | "security";
  metadata?: EventMetadata;
  delay?: number;
}

const typeConfig = {
  organization: {
    color: "text-primary",
    bg: "bg-primary/15",
    border: "border-primary/30",
  },
  billing: {
    color: "text-success",
    bg: "bg-success/15",
    border: "border-success/30",
  },
  system: {
    color: "text-warning",
    bg: "bg-warning/15",
    border: "border-warning/30",
  },
  security: {
    color: "text-primary",
    bg: "bg-primary/15",
    border: "border-primary/30",
  },
};

export function AdminActivityEventCard({
  icon: Icon,
  title,
  description,
  time,
  type,
  metadata,
  delay = 0,
}: AdminActivityEventCardProps) {
  const config = typeConfig[type];

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.3 }}
      className="relative flex gap-4 pb-8 last:pb-0"
    >
      {/* Timeline line */}
      <div className="absolute left-[19px] top-10 bottom-0 w-px bg-border last:hidden" />
      
      {/* Icon */}
      <div
        className={cn(
          "relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border",
          config.bg,
          config.border
        )}
      >
        <Icon className={cn("h-5 w-5", config.color)} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="bg-card rounded-lg border border-border/50 p-4 hover:bg-muted/30 transition-colors">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-foreground">{title}</h4>
              <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
              
              {/* Metadata */}
              {metadata && Object.keys(metadata).length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {Object.entries(metadata).map(([key, value]) => 
                    value ? (
                      <span
                        key={key}
                        className="inline-flex items-center gap-1 text-xs bg-muted px-2 py-1 rounded-md"
                      >
                        <span className="text-muted-foreground capitalize">{key}:</span>
                        <span className="text-foreground font-medium">{value}</span>
                      </span>
                    ) : null
                  )}
                </div>
              )}
            </div>
            
            {/* Time */}
            <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0">
              {time}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
