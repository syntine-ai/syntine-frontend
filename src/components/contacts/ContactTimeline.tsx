import { motion } from "framer-motion";
import { Phone, CheckCircle, XCircle, Smile, Meh, Frown, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface TimelineEvent {
  id: number;
  type: "call" | "answered" | "no_answer" | "failed";
  campaign: string;
  duration?: string;
  sentiment?: "positive" | "neutral" | "negative";
  timestamp: string;
  date: string;
}

const mockEvents: TimelineEvent[] = [
  { id: 1, type: "answered", campaign: "Renewal Follow-up", duration: "4:23", sentiment: "positive", timestamp: "2:34 PM", date: "Today" },
  { id: 2, type: "no_answer", campaign: "Customer Feedback", timestamp: "11:20 AM", date: "Today" },
  { id: 3, type: "answered", campaign: "Renewal Follow-up", duration: "2:45", sentiment: "neutral", timestamp: "3:15 PM", date: "Yesterday" },
  { id: 4, type: "failed", campaign: "Lead Qualification", timestamp: "10:00 AM", date: "Yesterday" },
  { id: 5, type: "answered", campaign: "Customer Feedback", duration: "5:12", sentiment: "positive", timestamp: "4:30 PM", date: "Dec 5" },
  { id: 6, type: "answered", campaign: "Renewal Follow-up", duration: "3:18", sentiment: "negative", timestamp: "2:00 PM", date: "Dec 4" },
];

const typeConfig = {
  call: { icon: Phone, color: "text-primary", bg: "bg-primary/10" },
  answered: { icon: CheckCircle, color: "text-success", bg: "bg-success/10" },
  no_answer: { icon: Clock, color: "text-muted-foreground", bg: "bg-muted" },
  failed: { icon: XCircle, color: "text-destructive", bg: "bg-destructive/10" },
};

const sentimentIcons = {
  positive: Smile,
  neutral: Meh,
  negative: Frown,
};

export function ContactTimeline() {
  return (
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />

      <div className="space-y-4">
        {mockEvents.map((event, i) => {
          const config = typeConfig[event.type];
          const Icon = config.icon;
          const SentimentIcon = event.sentiment ? sentimentIcons[event.sentiment] : null;

          return (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="relative pl-10"
            >
              {/* Timeline dot */}
              <div
                className={cn(
                  "absolute left-0 h-8 w-8 rounded-full flex items-center justify-center",
                  config.bg
                )}
              >
                <Icon className={cn("h-4 w-4", config.color)} />
              </div>

              {/* Content */}
              <div className="p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors">
                <div className="flex items-start justify-between mb-1">
                  <p className="font-medium text-foreground text-sm">
                    {event.type === "answered" ? "Call Answered" : event.type === "no_answer" ? "No Answer" : event.type === "failed" ? "Call Failed" : "Call"}
                  </p>
                  <span className="text-xs text-muted-foreground">
                    {event.date} · {event.timestamp}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mb-2">{event.campaign}</p>
                <div className="flex items-center gap-3">
                  {event.duration && (
                    <span className="text-xs text-foreground">
                      Duration: {event.duration}
                    </span>
                  )}
                  {SentimentIcon && event.sentiment && (
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 text-xs",
                        event.sentiment === "positive"
                          ? "text-success"
                          : event.sentiment === "negative"
                          ? "text-destructive"
                          : "text-muted-foreground"
                      )}
                    >
                      <SentimentIcon className="h-3 w-3" />
                      {event.sentiment.charAt(0).toUpperCase() + event.sentiment.slice(1)}
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
