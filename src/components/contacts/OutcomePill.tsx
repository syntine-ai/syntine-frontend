import { cn } from "@/lib/utils";
import { Phone, PhoneOff, PhoneMissed, XCircle } from "lucide-react";

type OutcomeType = "answered" | "no_answer" | "busy" | "failed";

interface OutcomePillProps {
  outcome: OutcomeType;
  showIcon?: boolean;
  className?: string;
}

const outcomeConfig: Record<OutcomeType, { label: string; className: string; icon: typeof Phone }> = {
  answered: {
    label: "Answered",
    className: "bg-success/10 text-success",
    icon: Phone,
  },
  no_answer: {
    label: "No Answer",
    className: "bg-muted text-muted-foreground",
    icon: PhoneMissed,
  },
  busy: {
    label: "Busy",
    className: "bg-warning/10 text-warning",
    icon: PhoneOff,
  },
  failed: {
    label: "Failed",
    className: "bg-destructive/10 text-destructive",
    icon: XCircle,
  },
};

export function OutcomePill({ outcome, showIcon = true, className }: OutcomePillProps) {
  const config = outcomeConfig[outcome];
  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
        config.className,
        className
      )}
    >
      {showIcon && <Icon className="h-3 w-3" />}
      {config.label}
    </span>
  );
}
