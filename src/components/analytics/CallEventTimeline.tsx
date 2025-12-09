import { motion } from "framer-motion";
import { Phone, PhoneCall, PhoneOff, CheckCircle, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

interface TimelineEvent {
  id: number;
  type: "ringing" | "connected" | "talking" | "sentiment" | "ended";
  title: string;
  description?: string;
  timestamp: string;
}

const mockEvents: TimelineEvent[] = [
  { id: 1, type: "ringing", title: "Call Initiated", description: "Dialing +91 90827 49283", timestamp: "2:30:00 PM" },
  { id: 2, type: "connected", title: "Call Connected", description: "Customer answered", timestamp: "2:30:05 PM" },
  { id: 3, type: "talking", title: "Conversation Started", description: "Agent introduced purpose", timestamp: "2:30:08 PM" },
  { id: 4, type: "sentiment", title: "Positive Sentiment Detected", description: "Customer showed interest", timestamp: "2:30:45 PM" },
  { id: 5, type: "ended", title: "Call Ended", description: "Duration: 2m 58s", timestamp: "2:32:58 PM" },
];

const typeConfig = {
  ringing: { icon: Phone, color: "text-warning", bg: "bg-warning/10" },
  connected: { icon: PhoneCall, color: "text-success", bg: "bg-success/10" },
  talking: { icon: MessageSquare, color: "text-primary", bg: "bg-primary/10" },
  sentiment: { icon: CheckCircle, color: "text-success", bg: "bg-success/10" },
  ended: { icon: PhoneOff, color: "text-muted-foreground", bg: "bg-muted" },
};

export function CallEventTimeline() {
  return (
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />

      <div className="space-y-4">
        {mockEvents.map((event, i) => {
          const config = typeConfig[event.type];
          const Icon = config.icon;

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
              <div className="py-1">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-foreground text-sm">{event.title}</p>
                  <span className="text-xs text-muted-foreground">{event.timestamp}</span>
                </div>
                {event.description && (
                  <p className="text-xs text-muted-foreground mt-0.5">{event.description}</p>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
