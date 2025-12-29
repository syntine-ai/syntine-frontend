import { cn } from "@/lib/utils";

type StatusType = "running" | "paused" | "draft" | "active" | "inactive" | "error" | "completed" | "scheduled" | "cancelled";

interface StatusPillProps {
  status: StatusType;
  className?: string;
}

const statusConfig: Record<StatusType, { label: string; className: string; dotClass: string }> = {
  running: {
    label: "Running",
    className: "bg-success/15 text-success border-success/40",
    dotClass: "bg-success animate-pulse",
  },
  active: {
    label: "Active",
    className: "bg-primary/15 text-primary border-primary/40",
    dotClass: "bg-primary animate-pulse",
  },
  paused: {
    label: "Paused",
    className: "bg-warning/15 text-warning border-warning/40",
    dotClass: "bg-warning",
  },
  scheduled: {
    label: "Scheduled",
    className: "bg-info/15 text-info border-info/40",
    dotClass: "bg-info",
  },
  draft: {
    label: "Draft",
    className: "bg-[rgba(255,255,255,0.06)] text-muted-foreground border-[rgba(255,255,255,0.12)]",
    dotClass: "bg-muted-foreground",
  },
  inactive: {
    label: "Inactive",
    className: "bg-[rgba(255,255,255,0.06)] text-muted-foreground border-[rgba(255,255,255,0.12)]",
    dotClass: "bg-muted-foreground",
  },
  error: {
    label: "Error",
    className: "bg-destructive/15 text-destructive border-destructive/40",
    dotClass: "bg-destructive",
  },
  completed: {
    label: "Completed",
    className: "bg-success/15 text-success border-success/40",
    dotClass: "bg-success",
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-destructive/15 text-destructive border-destructive/40",
    dotClass: "bg-destructive",
  },
};

export function StatusPill({ status, className }: StatusPillProps) {
  const config = statusConfig[status];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border",
        config.className,
        className
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", config.dotClass)} />
      {config.label}
    </span>
  );
}
