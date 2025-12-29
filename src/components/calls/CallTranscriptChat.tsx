import { motion } from "framer-motion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Bot, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface TranscriptMessage {
  id: number;
  speaker: "agent" | "caller";
  text: string;
  timestamp: string;
  latency?: string;
}

interface CallTranscriptChatProps {
  messages?: TranscriptMessage[];
  isAvailable: boolean;
}

export function CallTranscriptChat({ messages, isAvailable }: CallTranscriptChatProps) {
  if (!isAvailable || !messages || messages.length === 0) {
    return (
      <div className="bg-card rounded-xl border border-border/50 p-6">
        <h3 className="text-sm font-medium text-foreground mb-4">Transcript</h3>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="h-12 w-12 rounded-full bg-muted/50 flex items-center justify-center mb-3">
            <MessageSquare className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">Transcript not available for this call</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl border border-border/50 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-foreground">Transcript</h3>
        <Badge variant="secondary" className="text-xs">
          {messages.length} Messages
        </Badge>
      </div>

      <ScrollArea className="h-[400px] pr-4">
        <div className="space-y-4">
          {messages.map((message, index) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={cn(
                "flex gap-3",
                message.speaker === "agent" ? "justify-end" : "justify-start"
              )}
            >
              {message.speaker === "caller" && (
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <User className="h-4 w-4 text-primary" />
                </div>
              )}

              <div
                className={cn(
                  "max-w-[75%] rounded-xl p-4 space-y-2",
                  message.speaker === "agent"
                    ? "bg-primary/10 text-foreground rounded-tr-sm"
                    : "bg-muted text-foreground rounded-tl-sm"
                )}
              >
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={cn(
                      "text-xs font-semibold uppercase tracking-wide",
                      message.speaker === "agent" ? "text-primary" : "text-muted-foreground"
                    )}
                  >
                    {message.speaker === "agent" ? "AI Agent" : "Caller"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {message.timestamp}
                  </span>
                  {message.latency && (
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4">
                      {message.latency}
                    </Badge>
                  )}
                </div>
                <p className="text-sm leading-relaxed">{message.text}</p>
              </div>

              {message.speaker === "agent" && (
                <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center shrink-0">
                  <Bot className="h-4 w-4 text-primary-foreground" />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
