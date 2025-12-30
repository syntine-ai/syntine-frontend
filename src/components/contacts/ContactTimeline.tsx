import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Phone, CheckCircle, XCircle, Smile, Meh, Frown, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { format, formatDistanceToNow } from "date-fns";

interface TimelineEvent {
  id: string;
  type: "call" | "answered" | "no_answer" | "failed";
  campaign: string;
  duration?: string;
  sentiment?: "positive" | "neutral" | "negative";
  timestamp: string;
  date: string;
}

interface ContactTimelineProps {
  contactId?: string;
}

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

export function ContactTimeline({ contactId }: ContactTimelineProps) {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCallHistory = async () => {
      if (!contactId) {
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("calls")
          .select(`
            id,
            outcome,
            sentiment,
            duration_seconds,
            created_at,
            campaigns:campaign_id(name)
          `)
          .eq("contact_id", contactId)
          .order("created_at", { ascending: false })
          .limit(10);

        if (error) {
          console.error("Error fetching call history:", error);
          setEvents([]);
        } else if (data) {
          const formattedEvents: TimelineEvent[] = data.map((call) => {
            // Map outcome to type
            let type: TimelineEvent["type"] = "call";
            if (call.outcome === "answered") type = "answered";
            else if (call.outcome === "no_answer" || call.outcome === "voicemail") type = "no_answer";
            else if (call.outcome === "failed" || call.outcome === "busy") type = "failed";

            // Format duration
            let duration: string | undefined;
            if (call.duration_seconds) {
              const mins = Math.floor(call.duration_seconds / 60);
              const secs = call.duration_seconds % 60;
              duration = `${mins}:${secs.toString().padStart(2, "0")}`;
            }

            // Format date
            const callDate = new Date(call.created_at || Date.now());
            const today = new Date();
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);

            let dateLabel: string;
            if (callDate.toDateString() === today.toDateString()) {
              dateLabel = "Today";
            } else if (callDate.toDateString() === yesterday.toDateString()) {
              dateLabel = "Yesterday";
            } else {
              dateLabel = format(callDate, "MMM d");
            }

            return {
              id: call.id,
              type,
              campaign: (call.campaigns as any)?.name || "Direct Call",
              duration,
              sentiment: call.sentiment as TimelineEvent["sentiment"] | undefined,
              timestamp: format(callDate, "h:mm a"),
              date: dateLabel,
            };
          });

          setEvents(formattedEvents);
        }
      } catch (err) {
        console.error("Error:", err);
        setEvents([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCallHistory();
  }, [contactId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8 text-muted-foreground">
        Loading call history...
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="flex items-center justify-center py-8 text-muted-foreground text-sm">
        No call history yet
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />

      <div className="space-y-4">
        {events.map((event, i) => {
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
