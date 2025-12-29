import { cn } from "@/lib/utils";
import { Smile, Meh, Frown, HelpCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type SentimentType = "positive" | "neutral" | "negative" | "not_analyzed";

interface SentimentBadgeProps {
  sentiment: SentimentType;
  showIcon?: boolean;
  className?: string;
}

const sentimentConfig: Record<SentimentType, { label: string; className: string; icon: typeof Smile; tooltip?: string }> = {
  positive: {
    label: "Positive",
    className: "bg-success/15 text-success border-success/40",
    icon: Smile,
  },
  neutral: {
    label: "Neutral",
    className: "bg-[rgba(255,255,255,0.06)] text-muted-foreground border-[rgba(255,255,255,0.12)]",
    icon: Meh,
  },
  negative: {
    label: "Negative",
    className: "bg-destructive/15 text-destructive border-destructive/40",
    icon: Frown,
  },
  not_analyzed: {
    label: "Not Analyzed",
    className: "bg-transparent text-muted-foreground border-border",
    icon: HelpCircle,
    tooltip: "This contact has not been called yet",
  },
};

export function SentimentBadge({ sentiment, showIcon = true, className }: SentimentBadgeProps) {
  const config = sentimentConfig[sentiment];
  const Icon = config.icon;

  const badge = (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border transition-colors",
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
          <TooltipTrigger asChild>{badge}</TooltipTrigger>
          <TooltipContent className="bg-popover border-border">
            <p className="text-xs">{config.tooltip}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return badge;
}
