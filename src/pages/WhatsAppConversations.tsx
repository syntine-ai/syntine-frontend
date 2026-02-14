import { useState, useCallback, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { PageContainer } from "@/components/layout/PageContainer";
import { ConversationList } from "@/components/whatsapp/ConversationList";
import { ConversationThread } from "@/components/whatsapp/ConversationThread";
import { InternalNotesPanel } from "@/components/whatsapp/InternalNotesPanel";
import { SendTemplateModal } from "@/components/whatsapp/SendTemplateModal";
import { SendMediaModal } from "@/components/whatsapp/SendMediaModal";
import { chatService } from "@/api/services/chat.service";
import {
  demoWAInternalNotes,
  type ConversationStatus, type MessageSender,
} from "@/data/demoWhatsAppData";
import { supabase } from "@/integrations/supabase/client";

export default function WhatsAppConversations() {
  const queryClient = useQueryClient();

  /* ─── API Queries ─── */
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // UI State
  const [notesOpen, setNotesOpen] = useState(false);
  const [templateOpen, setTemplateOpen] = useState(false);
  const [mediaOpen, setMediaOpen] = useState(false);

  // Fetch Sessions
  const { data: apiSessions = [], isLoading: isLoadingSessions, refetch: refetchSessions } = useQuery({
    queryKey: ["chat-sessions", statusFilter],
    queryFn: async () => {
      const filters: any = {};
      if (statusFilter !== "All") filters.status = statusFilter.toLowerCase();
      // Map frontend status to backend status
      if (statusFilter === "Active") filters.status = "active"; // includes active_ai
      if (statusFilter === "Closed") filters.status = "closed";

      const sessions = await chatService.getSessions(filters);
      return sessions;
    },
    refetchInterval: 5000 // Poll for new sessions
  });

  // Auto-select first session if none selected and sessions loaded
  const [autoSelected, setAutoSelected] = useState(false);
  useEffect(() => {
    if (apiSessions.length > 0 && !selectedId && !autoSelected) {
      setSelectedId(apiSessions[0].id);
      setAutoSelected(true);
    }
  }, [apiSessions, selectedId, autoSelected]);

  // Real-time Updates (Supabase)
  useEffect(() => {
    const channel = supabase
      .channel("chat-updates")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "chat_messages" },
        (payload) => {
          // If new message in selected session, refresh messages
          if (selectedId && (payload.new as any).session_id === selectedId) {
            queryClient.invalidateQueries({ queryKey: ["chat-messages", selectedId] });
          }
          // Always refresh sessions list (timestamp/last msg)
          queryClient.invalidateQueries({ queryKey: ["chat-sessions"] });
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "chat_sessions" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["chat-sessions"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedId, queryClient]);


  // Fetch Messages for Selected Session
  const { data: apiMessages = [], refetch: refetchMessages } = useQuery({
    queryKey: ["chat-messages", selectedId],
    queryFn: () => chatService.getSessionMessages(selectedId!),
    enabled: !!selectedId,
    refetchInterval: 3000 // Poll for new messages
  });

  // Map API data to UI format
  const conversations = apiSessions.map((s: any) => ({
    id: s.id,
    customer_phone: s.external_id || "Unknown",
    customer_name: s.metadata?.customer_name || s.external_id || "Unknown",
    trigger_type: s.channel,
    status: s.status,
    conversation_status: (s.status === "human_handover" ? "human_active" : s.status === "active" ? "active_ai" : "closed") as ConversationStatus,
    assigned_to: s.metadata?.assigned_to || null,
    last_message_at: s.last_message_at || s.created_at,
    last_message: s.conversation_summary || "View conversation",
    order_number: s.metadata?.order_number || null,
    unread: 0
  }));

  const messages = selectedId ? apiMessages.map((m: any) => ({
    id: m.id,
    direction: (m.sender === "user" ? "inbound" : "outbound") as "inbound" | "outbound",
    content: m.content,
    status: "delivered", // API doesn't have status yet
    created_at: m.created_at,
    message_type: (m.message_type || "text") as "text" | "template" | "media",
    sender: (m.sender === "user" ? "customer" : m.sender === "human_agent" ? "human" : "ai") as MessageSender
  })) : [];

  const selected = conversations.find((c: any) => c.id === selectedId) || null;
  const currentNotes = selectedId ? demoWAInternalNotes[selectedId] || [] : []; // Notes still dummy for now

  /* ─── Handlers ─── */

  /* ─── Handlers ─── */

  const sendMessageMutation = useMutation({
    mutationFn: async ({ content, type }: { content: string, type: string }) => {
      if (!selectedId) return;
      if (selected?.status === "closed") return; // Can't reply to closed

      // We use human_reply endpoint
      await chatService.sendHumanReply(selectedId, content);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chat-messages", selectedId] });
      refetchMessages();
    }
  });

  const handleSendMessage = (content: string) => {
    sendMessageMutation.mutate({ content, type: "text" });
  };

  const templateMutation = useMutation({
    mutationFn: async ({ name, vars }: { name: string, vars: Record<string, any> }) => {
      if (!selectedId) return;
      await chatService.sendTemplate(selectedId, name, vars);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chat-messages", selectedId] });
      refetchMessages();
      toast.success("Template sent successfully");
    },
    onError: (err: any) => {
      toast.error("Failed to send template");
      console.error(err);
    }
  });

  const handleSendTemplate = (templateName: string, variables: Record<string, string>) => {
    templateMutation.mutate({ name: templateName, vars: variables });
  };

  const handleSendMedia = (mediaType: "image" | "video", caption: string) => {
    // Not implemented in backend yet
    console.log("Send media", mediaType);
  };

  // Status Updates (Mocked for now as backend endpoint missing for status change)
  const statusMutation = useMutation({
    mutationFn: async ({ status, assignedTo }: { status: "active" | "closed" | "human_handover", assignedTo?: string | null }) => {
      if (!selectedId) return;
      await chatService.updateSessionStatus(selectedId, status, assignedTo);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chat-sessions"] });
      refetchSessions();
    }
  });

  const updateConvStatus = (status: ConversationStatus, assignedTo: string | null) => {
    let backendStatus: "active" | "closed" | "human_handover" = "active";
    if (status === "human_active") backendStatus = "human_handover";
    if (status === "closed") backendStatus = "closed";
    if (status === "active_ai") backendStatus = "active";

    statusMutation.mutate({ status: backendStatus, assignedTo });
  };

  const handleTakeOver = () => updateConvStatus("human_active", "You");
  const handleHandBack = () => updateConvStatus("active_ai", null);
  const handleClose = () => updateConvStatus("closed", null);

  return (
    <PageContainer title="Conversations" subtitle="WhatsApp message threads">
      <div className="flex gap-3 h-[calc(100vh-220px)] min-h-[500px]">
        <ConversationList
          conversations={conversations}
          selectedId={selectedId}
          onSelect={setSelectedId}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
        />
        <ConversationThread
          conversation={selected}
          messages={messages}
          onTakeOver={handleTakeOver}
          onHandBack={handleHandBack}
          onCloseConv={handleClose}
          onSendMessage={handleSendMessage}
          onOpenTemplate={() => setTemplateOpen(true)}
          onOpenMedia={() => setMediaOpen(true)}
        />
        <InternalNotesPanel
          notes={currentNotes}
          collapsed={!notesOpen}
          onToggle={() => setNotesOpen((v) => !v)}
        />
      </div>

      <SendTemplateModal open={templateOpen} onClose={() => setTemplateOpen(false)} onSend={handleSendTemplate} />
      <SendMediaModal open={mediaOpen} onClose={() => setMediaOpen(false)} onSend={handleSendMedia} />
    </PageContainer>
  );
}
