import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { MessageCircle, User } from "lucide-react";

interface Message {
  id: string;
  direction: "inbound" | "outbound";
  content: string;
  status: string;
  created_at: string;
}

interface Conversation {
  id: string;
  customer_phone: string;
  customer_name: string;
  trigger_type: string;
  status: string;
  order_number: string | null;
}

interface ConversationThreadProps {
  conversation: Conversation | null;
  messages: Message[];
}

export function ConversationThread({ conversation, messages }: ConversationThreadProps) {
  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center border border-border rounded-lg bg-card">
        <div className="text-center text-muted-foreground">
          <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-20" />
          <p className="text-sm">Select a conversation to view messages</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col border border-border rounded-lg overflow-hidden bg-card">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border flex items-center gap-3">
        <div className="h-9 w-9 rounded-full bg-[hsl(142,71%,45%)]/10 flex items-center justify-center">
          <User className="h-4 w-4 text-[hsl(142,71%,45%)]" />
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">{conversation.customer_name}</p>
          <p className="text-xs text-muted-foreground">
            {conversation.customer_phone}
            {conversation.order_number && ` · ${conversation.order_number}`}
          </p>
        </div>
        <div className="ml-auto">
          <span className={cn(
            "text-xs px-2 py-0.5 rounded-full font-medium",
            conversation.status === "active" ? "badge-success" : "badge-neutral"
          )}>
            {conversation.status}
          </span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn("flex", msg.direction === "outbound" ? "justify-end" : "justify-start")}
          >
            <div
              className={cn(
                "max-w-[75%] rounded-2xl px-4 py-2.5 text-sm",
                msg.direction === "outbound"
                  ? "bg-[hsl(142,71%,45%)]/15 text-foreground rounded-br-sm"
                  : "bg-muted text-foreground rounded-bl-sm"
              )}
            >
              <p>{msg.content}</p>
              <div className="flex items-center justify-end gap-1 mt-1">
                <span className="text-[10px] text-muted-foreground">
                  {format(new Date(msg.created_at), "HH:mm")}
                </span>
                {msg.direction === "outbound" && (
                  <span className="text-[10px] text-muted-foreground">
                    {msg.status === "read" ? "✓✓" : msg.status === "delivered" ? "✓✓" : "✓"}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
