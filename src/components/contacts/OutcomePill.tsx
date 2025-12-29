import { cn } from "@/lib/utils";
import { Phone, PhoneOff, PhoneMissed, XCircle, Clock } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type OutcomeType = "answered" | "no_answer" | "busy" | "failed" | "not_called";

interface OutcomePillProps {
  outcome: OutcomeType;
  showIcon?: boolean;
  className?: string;
}

const outcomeConfig: Record<OutcomeType, { label: string; className: string; icon: typeof Phone; tooltip?: string }> = {
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
  not_called: {
    label: "Not Called",
    className: "bg-transparent text-muted-foreground border border-border",
    icon: Clock,
    tooltip: "This contact has not been called yet",
  },
};

export function OutcomePill({ outcome, showIcon = true, className }: OutcomePillProps) {
  const config = outcomeConfig[outcome];
  const Icon = config.icon;

  const pill = (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors",
        config.className,
        className
      )}
    >
      {showIcon && <Icon className="h-3 w-3" />}
      {config.label}
    </span>
  );

  if (config.tooltip) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>{pill}</TooltipTrigger>
          <TooltipContent className="bg-popover border-border">
            <p className="text-xs">{config.tooltip}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return pill;
}
