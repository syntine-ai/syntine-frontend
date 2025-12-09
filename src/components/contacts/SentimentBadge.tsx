import { cn } from "@/lib/utils";
import { Smile, Meh, Frown } from "lucide-react";

type SentimentType = "positive" | "neutral" | "negative";

interface SentimentBadgeProps {
  sentiment: SentimentType;
  showIcon?: boolean;
  className?: string;
}

const sentimentConfig: Record<SentimentType, { label: string; className: string; icon: typeof Smile }> = {
  positive: {
    label: "Positive",
    className: "bg-success/10 text-success border-success/20",
    icon: Smile,
  },
  neutral: {
    label: "Neutral",
    className: "bg-muted text-muted-foreground border-border",
    icon: Meh,
  },
  negative: {
    label: "Negative",
    className: "bg-destructive/10 text-destructive border-destructive/20",
    icon: Frown,
  },
};

export function SentimentBadge({ sentiment, showIcon = true, className }: SentimentBadgeProps) {
  const config = sentimentConfig[sentiment];
  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border",
        config.className,
        className
      )}
    >
      {showIcon && <Icon className="h-3 w-3" />}
      {config.label}
    </span>
  );
}
