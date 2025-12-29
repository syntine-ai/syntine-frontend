import { motion } from "framer-motion";
import { BarChart3, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface CallSentimentCardProps {
  sentiment?: "positive" | "neutral" | "negative";
  confidenceScore?: number;
  summary?: string;
  isAnalyzed: boolean;
}

const sentimentConfig = {
  positive: {
    label: "Positive",
    icon: TrendingUp,
    color: "text-success",
    bgColor: "bg-success/10",
    borderColor: "border-success/30",
  },
  neutral: {
    label: "Neutral",
    icon: Minus,
    color: "text-warning",
    bgColor: "bg-warning/10",
    borderColor: "border-warning/30",
  },
  negative: {
    label: "Negative",
    icon: TrendingDown,
    color: "text-destructive",
    bgColor: "bg-destructive/10",
    borderColor: "border-destructive/30",
  },
};

export function CallSentimentCard({
  sentiment,
  confidenceScore,
  summary,
  isAnalyzed,
}: CallSentimentCardProps) {
  if (!isAnalyzed) {
    return (
      <div className="bg-card rounded-xl border border-border/50 p-6">
        <h3 className="text-sm font-medium text-foreground mb-4">Summary & Sentiment</h3>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="h-12 w-12 rounded-full bg-muted/50 flex items-center justify-center mb-3">
            <BarChart3 className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">No analysis available</p>
          <p className="text-xs text-muted-foreground/70 mt-1">
            Only answered calls are analyzed
          </p>
        </div>
      </div>
    );
  }

  const config = sentiment ? sentimentConfig[sentiment] : sentimentConfig.neutral;
  const SentimentIcon = config.icon;

  return (
    <div className="bg-card rounded-xl border border-border/50 p-6">
      <h3 className="text-sm font-medium text-foreground mb-4">Summary & Sentiment</h3>

      <div className="space-y-4">
        {/* Sentiment Badge */}
        <div className="flex items-center gap-4">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg border",
              config.bgColor,
              config.borderColor
            )}
          >
            <SentimentIcon className={cn("h-5 w-5", config.color)} />
            <span className={cn("font-medium", config.color)}>{config.label}</span>
          </motion.div>

          {confidenceScore !== undefined && (
            <div className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{confidenceScore}%</span> confidence
            </div>
          )}
        </div>

        {/* Confidence Bar */}
        {confidenceScore !== undefined && (
          <div className="space-y-1">
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${confidenceScore}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className={cn(
                  "h-full rounded-full",
                  sentiment === "positive" && "bg-success",
                  sentiment === "neutral" && "bg-warning",
                  sentiment === "negative" && "bg-destructive"
                )}
              />
            </div>
          </div>
        )}

        {/* AI Summary */}
        {summary && (
          <div className="pt-2">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">
              AI Summary
            </p>
            <p className="text-sm text-foreground leading-relaxed">{summary}</p>
          </div>
        )}
      </div>
    </div>
  );
}
