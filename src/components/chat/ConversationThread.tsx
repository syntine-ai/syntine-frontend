import { useState } from "react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import {
  MessageCircle, User, Bot, UserCheck, Hand, XCircle, AlertTriangle,
  Send, FileText, Image as ImageIcon, type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { motion, AnimatePresence } from "framer-motion";
import type { ConversationStatus, MessageType, MessageSender } from "@/data/demoChatData";

/* ─── Types ─── */

interface Message {
  id: string;
  direction: "inbound" | "outbound";
  content: string;
  status: string;
  created_at: string;
  message_type: MessageType;
  sender: MessageSender;
  template_name?: string;
  media_url?: string;
  media_type?: "image" | "video";
}

interface Conversation {
  id: string;
  customer_phone: string;
  customer_name: string;
  trigger_type: string;
  status: string;
  conversation_status: ConversationStatus;
  assigned_to: string | null;
  order_number: string | null;
}

interface ConversationThreadProps {
  conversation: Conversation | null;
  messages: Message[];
  onTakeOver: () => void;
  onHandBack: () => void;
  onCloseConv: () => void;
  onSendMessage: (content: string) => void;
  onOpenTemplate: () => void;
  onOpenMedia: () => void;
}

/* ─── Status config ─── */

const statusConfig: Record<ConversationStatus, { label: string; color: string; icon: LucideIcon }> = {
  active_ai: { label: "Active (AI)", color: "bg-[hsl(var(--success))]/15 text-[hsl(var(--success))] border-[hsl(var(--success))]/30", icon: Bot },
  needs_human: { label: "Needs Human", color: "bg-[hsl(var(--warning))]/15 text-[hsl(var(--warning))] border-[hsl(var(--warning))]/30", icon: AlertTriangle },
  human_active: { label: "Human Active", color: "bg-[hsl(var(--accent))]/15 text-[hsl(var(--accent))] border-[hsl(var(--accent))]/30", icon: UserCheck },
  closed: { label: "Closed", color: "bg-muted/50 text-muted-foreground border-border", icon: XCircle },
};

const senderConfig: Record<MessageSender, { label: string; icon: LucideIcon; color: string }> = {
  ai: { label: "AI", icon: Bot, color: "text-[hsl(var(--success))]" },
  human: { label: "Human", icon: UserCheck, color: "text-[hsl(var(--accent))]" },
  customer: { label: "", icon: User, color: "text-muted-foreground" },
};

/* ─── Component ─── */

export function ConversationThread({
  conversation, messages, onTakeOver, onHandBack, onCloseConv, onSendMessage, onOpenTemplate, onOpenMedia,
}: ConversationThreadProps) {
  const [draft, setDraft] = useState("");

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

  const sc = statusConfig[conversation.conversation_status];
  const StatusIcon = sc.icon;

  const handleSend = () => {
    if (!draft.trim()) return;
    onSendMessage(draft.trim());
    setDraft("");
  };

  return (
    <div className="flex-1 flex flex-col border border-border rounded-lg overflow-hidden bg-card">
      {/* ─── Header ─── */}
      <div className="px-4 py-2.5 border-b border-border flex items-center gap-3">
        <div className="h-9 w-9 rounded-full bg-[hsl(var(--success))]/10 flex items-center justify-center shrink-0">
          <User className="h-4 w-4 text-[hsl(var(--success))]" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground">{conversation.customer_name}</p>
          <p className="text-xs text-muted-foreground">
            {conversation.customer_phone}
            {conversation.order_number && ` · ${conversation.order_number}`}
          </p>
        </div>

        {/* Status badge */}
        <span className={cn("inline-flex items-center gap-1.5 text-[11px] px-2 py-1 rounded-md font-medium border", sc.color)}>
          <StatusIcon className="h-3 w-3" />
          {sc.label}
        </span>

        {/* Assignment */}
        <span className="text-[11px] text-muted-foreground hidden lg:block">
          {conversation.conversation_status === "human_active" && conversation.assigned_to
            ? `Assigned to: ${conversation.assigned_to}`
            : conversation.conversation_status === "active_ai"
            ? "Handled by AI"
            : "Unassigned"}
        </span>

        {/* Controls */}
        <TooltipProvider delayDuration={200}>
          <div className="flex items-center gap-1 ml-1">
            {conversation.conversation_status !== "human_active" && conversation.conversation_status !== "closed" && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={onTakeOver}>
                    <Hand className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Take Over</TooltipContent>
              </Tooltip>
            )}
            {conversation.conversation_status === "human_active" && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={onHandBack}>
                    <Bot className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Hand Back to AI</TooltipContent>
              </Tooltip>
            )}
            {conversation.conversation_status !== "closed" && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={onCloseConv}>
                    <XCircle className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Close Conversation</TooltipContent>
              </Tooltip>
            )}
          </div>
        </TooltipProvider>
      </div>

      {/* ─── Warning banner ─── */}
      <AnimatePresence>
        {conversation.conversation_status === "needs_human" && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-[hsl(var(--warning))]/10 border-b border-[hsl(var(--warning))]/20 px-4 py-2 flex items-center gap-2"
          >
            <AlertTriangle className="h-3.5 w-3.5 text-[hsl(var(--warning))]" />
            <span className="text-xs text-[hsl(var(--warning))]">AI has flagged this conversation for human attention.</span>
          </motion.div>
        )}
        {conversation.conversation_status === "human_active" && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-[hsl(var(--accent))]/10 border-b border-[hsl(var(--accent))]/20 px-4 py-2 flex items-center gap-2"
          >
            <UserCheck className="h-3.5 w-3.5 text-[hsl(var(--accent))]" />
            <span className="text-xs text-[hsl(var(--accent))]">Human replying · {conversation.assigned_to || "You"}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Messages ─── */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg) => {
          const sender = senderConfig[msg.sender];
          const SenderIcon = sender.icon;

          return (
            <div
              key={msg.id}
              className={cn("flex", msg.direction === "outbound" ? "justify-end" : "justify-start")}
            >
              <div className="max-w-[75%] space-y-0.5">
                {/* Sender label for outbound */}
                {msg.direction === "outbound" && msg.sender !== "customer" && (
                  <div className="flex items-center gap-1 justify-end mb-0.5">
                    <SenderIcon className={cn("h-3 w-3", sender.color)} />
                    <span className={cn("text-[10px] font-medium", sender.color)}>{sender.label}</span>
                    {msg.message_type === "template" && (
                      <span className="text-[10px] text-muted-foreground ml-1">· Template</span>
                    )}
                  </div>
                )}

                <div
                  className={cn(
                    "rounded-2xl px-4 py-2.5 text-sm",
                    msg.direction === "outbound"
                      ? msg.sender === "human"
                        ? "bg-[hsl(var(--accent))]/15 text-foreground rounded-br-sm"
                        : "bg-[hsl(var(--success))]/15 text-foreground rounded-br-sm"
                      : "bg-muted text-foreground rounded-bl-sm",
                    msg.message_type === "template" && msg.direction === "outbound" && "border border-dashed border-[hsl(var(--success))]/30"
                  )}
                >
                  {msg.message_type === "media" && (
                    <div className="bg-muted/50 rounded-lg p-6 mb-2 flex items-center justify-center">
                      <ImageIcon className="h-8 w-8 text-muted-foreground opacity-40" />
                    </div>
                  )}
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
            </div>
          );
        })}
      </div>

      {/* ─── Composer ─── */}
      {conversation.conversation_status !== "closed" ? (
        <div className="px-3 py-2.5 border-t border-border">
          <div className="flex items-end gap-2">
            <TooltipProvider delayDuration={200}>
              <div className="flex gap-0.5 shrink-0 pb-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={onOpenTemplate}>
                      <FileText className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Send Template</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={onOpenMedia}>
                      <ImageIcon className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Send Media</TooltipContent>
                </Tooltip>
              </div>
            </TooltipProvider>

            <Textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={
                conversation.conversation_status === "human_active"
                  ? "Type a message as human agent..."
                  : "Type a message..."
              }
              className="min-h-[40px] max-h-[120px] resize-none text-sm flex-1"
              rows={1}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            />

            <Button size="icon" className="h-9 w-9 shrink-0 mb-0.5" onClick={handleSend} disabled={!draft.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="px-4 py-3 border-t border-border text-center">
          <p className="text-xs text-muted-foreground">This conversation is closed</p>
        </div>
      )}
    </div>
  );
}
