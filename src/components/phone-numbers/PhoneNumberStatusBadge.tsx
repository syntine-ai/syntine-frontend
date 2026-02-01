import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface PhoneNumberStatusBadgeProps {
  status: "available" | "assigned" | "reserved";
  hasAgent?: boolean;
}

export function PhoneNumberStatusBadge({ status, hasAgent }: PhoneNumberStatusBadgeProps) {
  // If assigned and has an agent, show as "Connected"
  const displayStatus = status === "assigned" && hasAgent ? "connected" : status;

  const config = {
    available: {
      label: "Available",
      className: "bg-muted text-muted-foreground border-border",
    },
    assigned: {
      label: "Assigned",
      className: "bg-primary/10 text-primary border-primary/40",
    },
    connected: {
      label: "Connected",
      className: "bg-success/15 text-success border-success/40",
    },
    reserved: {
      label: "Reserved",
      className: "bg-warning/15 text-warning border-warning/40",
    },
  };

  const { label, className } = config[displayStatus] || config.available;

  return (
    <Badge variant="outline" className={cn("border", className)}>
      {label}
    </Badge>
  );
}
