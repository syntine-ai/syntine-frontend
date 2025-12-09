import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface TranscriptEntry {
  speaker: "agent" | "caller";
  text: string;
  timestamp: string;
}

const mockTranscript: TranscriptEntry[] = [
  { speaker: "agent", text: "Hello! This is Sarah from Acme Corp. Am I speaking with John?", timestamp: "0:00" },
  { speaker: "caller", text: "Yes, this is John. How can I help you?", timestamp: "0:05" },
  { speaker: "agent", text: "Hi John! I'm calling regarding your subscription renewal. Your current plan expires next week, and I wanted to discuss your options.", timestamp: "0:08" },
  { speaker: "caller", text: "Oh right, I was meaning to look into that. What are my options?", timestamp: "0:18" },
  { speaker: "agent", text: "Great question! We have three renewal options available. Our most popular is the annual plan which saves you 20% compared to monthly billing.", timestamp: "0:22" },
  { speaker: "caller", text: "That sounds interesting. What's the price difference?", timestamp: "0:32" },
  { speaker: "agent", text: "With the annual plan, you'd pay $199 per year instead of $24.99 per month. That's a savings of about $100 annually.", timestamp: "0:36" },
  { speaker: "caller", text: "Hmm, let me think about it. Can you send me the details via email?", timestamp: "0:48" },
  { speaker: "agent", text: "Absolutely! I'll send you a summary with all the plan options right away. Is there anything else I can help you with today?", timestamp: "0:52" },
  { speaker: "caller", text: "No, that's all. Thank you for calling.", timestamp: "1:02" },
  { speaker: "agent", text: "Thank you, John! Have a great day. Goodbye!", timestamp: "1:05" },
];

interface TranscriptViewerProps {
  className?: string;
}

export function TranscriptViewer({ className }: TranscriptViewerProps) {
  return (
    <ScrollArea className={cn("h-[300px] rounded-lg border border-border bg-secondary/20 p-4", className)}>
      <div className="space-y-4">
        {mockTranscript.map((entry, i) => (
          <div
            key={i}
            className={cn(
              "flex gap-3",
              entry.speaker === "agent" ? "flex-row" : "flex-row-reverse"
            )}
          >
            <div
              className={cn(
                "max-w-[80%] rounded-lg p-3",
                entry.speaker === "agent"
                  ? "bg-primary/10 text-foreground"
                  : "bg-card text-foreground border border-border"
              )}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold capitalize">
                  {entry.speaker === "agent" ? "AI Agent" : "Customer"}
                </span>
                <span className="text-xs text-muted-foreground">{entry.timestamp}</span>
              </div>
              <p className="text-sm">{entry.text}</p>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
