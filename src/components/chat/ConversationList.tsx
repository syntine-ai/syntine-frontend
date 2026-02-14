import { useState } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Search, MessageCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Conversation {
  id: string;
  customer_phone: string;
  customer_name: string;
  trigger_type: string;
  status: string;
  last_message_at: string;
  last_message: string;
  order_number: string | null;
  unread: number;
}

interface ConversationListProps {
  conversations: Conversation[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

const statusFilters = ["All", "Active", "Closed"] as const;

const triggerLabels: Record<string, string> = {
  cod_confirmation: "COD",
  cart_recovery: "Cart",
  support_chat: "Support",
};

export function ConversationList({ conversations, selectedId, onSelect }: ConversationListProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");

  const filtered = conversations.filter((c) => {
    const matchSearch = c.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      c.customer_phone.includes(search);
    const matchStatus = statusFilter === "All" || c.status.toLowerCase() === statusFilter.toLowerCase();
    return matchSearch && matchStatus;
  });

  return (
    <div className="w-80 shrink-0 flex flex-col border border-border rounded-lg overflow-hidden bg-card">
      <div className="p-3 border-b border-border space-y-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            className="pl-8 h-9 text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-1">
          {statusFilters.map((f) => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={cn(
                "text-xs px-2.5 py-1 rounded-md font-medium transition-colors",
                statusFilter === f
                  ? "bg-[hsl(142,71%,45%)]/15 text-[hsl(142,71%,45%)]"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filtered.map((conv) => (
          <button
            key={conv.id}
            onClick={() => onSelect(conv.id)}
            className={cn(
              "w-full text-left p-3 border-b border-border transition-colors",
              selectedId === conv.id ? "bg-muted/40" : "hover:bg-muted/20"
            )}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground truncate">{conv.customer_name}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-medium">
                    {triggerLabels[conv.trigger_type] || conv.trigger_type}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground truncate mt-0.5">{conv.last_message}</p>
              </div>
              <div className="flex flex-col items-end gap-1 ml-2 shrink-0">
                <span className="text-[10px] text-muted-foreground">
                  {formatDistanceToNow(new Date(conv.last_message_at), { addSuffix: true })}
                </span>
                {conv.unread > 0 && (
                  <span className="h-4 min-w-[16px] flex items-center justify-center rounded-full bg-[hsl(142,71%,45%)] text-[10px] font-bold text-white px-1">
                    {conv.unread}
                  </span>
                )}
              </div>
            </div>
          </button>
        ))}
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <MessageCircle className="h-8 w-8 mb-2 opacity-30" />
            <p className="text-sm">No conversations found</p>
          </div>
        )}
      </div>
    </div>
  );
}
