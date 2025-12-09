import { cn } from "@/lib/utils";

type StatusType = "running" | "paused" | "draft" | "active" | "inactive" | "error";

interface StatusPillProps {
  status: StatusType;
  className?: string;
}

const statusConfig: Record<StatusType, { label: string; className: string }> = {
  running: {
    label: "Running",
    className: "bg-success/10 text-success border-success/20",
  },
  paused: {
    label: "Paused",
    className: "bg-warning/10 text-warning border-warning/20",
  },
  draft: {
    label: "Draft",
    className: "bg-muted text-muted-foreground border-border",
  },
  active: {
    label: "Active",
    className: "bg-success/10 text-success border-success/20",
  },
  inactive: {
    label: "Inactive",
    className: "bg-muted text-muted-foreground border-border",
  },
  error: {
    label: "Error",
    className: "bg-destructive/10 text-destructive border-destructive/20",
  },
};

export function StatusPill({ status, className }: StatusPillProps) {
  const config = statusConfig[status];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border",
        config.className,
        className
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          status === "running" || status === "active"
            ? "bg-success animate-pulse"
            : status === "paused"
            ? "bg-warning"
            : status === "error"
            ? "bg-destructive"
            : "bg-muted-foreground"
        )}
      />
      {config.label}
    </span>
  );
}
