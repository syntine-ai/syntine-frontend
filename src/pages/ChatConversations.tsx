import { useState, useCallback } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { ConversationList } from "@/components/chat/ConversationList";
import { ConversationThread } from "@/components/chat/ConversationThread";
import { InternalNotesPanel } from "@/components/chat/InternalNotesPanel";
import { SendTemplateModal } from "@/components/chat/SendTemplateModal";
import { SendMediaModal } from "@/components/chat/SendMediaModal";
import {
  demoChatConversations, demoChatMessages, demoChatInternalNotes,
  type ConversationStatus, type MessageSender,
} from "@/data/demoChatData";

export default function ChatConversations() {
  const [conversations, setConversations] = useState(demoChatConversations);
  const [messages, setMessages] = useState(demoChatMessages);
  const [selectedId, setSelectedId] = useState<string | null>(conversations[0]?.id || null);
  const [notesOpen, setNotesOpen] = useState(false);
  const [templateOpen, setTemplateOpen] = useState(false);
  const [mediaOpen, setMediaOpen] = useState(false);

  const selected = conversations.find((c) => c.id === selectedId) || null;
  const currentMessages = selectedId ? messages[selectedId] || [] : [];
  const currentNotes = selectedId ? demoChatInternalNotes[selectedId] || [] : [];

  /* ─── State helpers ─── */

  const updateConvStatus = useCallback((status: ConversationStatus, assignedTo: string | null) => {
    if (!selectedId) return;
    setConversations((prev) =>
      prev.map((c) => c.id === selectedId ? { ...c, conversation_status: status, assigned_to: assignedTo, status: status === "closed" ? "closed" : "active" } : c)
    );
  }, [selectedId]);

  const addMessage = useCallback((content: string, sender: MessageSender, type: "text" | "template" | "media" = "text") => {
    if (!selectedId) return;
    setMessages((prev) => ({
      ...prev,
      [selectedId]: [
        ...(prev[selectedId] || []),
        {
          id: `local-${Date.now()}`,
          direction: "outbound" as const,
          content,
          status: "sent",
          created_at: new Date().toISOString(),
          message_type: type,
          sender,
        },
      ],
    }));
  }, [selectedId]);

  const handleTakeOver = () => {
    updateConvStatus("human_active", "You");
  };

  const handleHandBack = () => {
    updateConvStatus("active_ai", null);
  };

  const handleClose = () => {
    updateConvStatus("closed", null);
  };

  const handleSendMessage = (content: string) => {
    const sender: MessageSender = selected?.conversation_status === "human_active" ? "human" : "ai";
    addMessage(content, sender);
  };

  const handleSendTemplate = (templateName: string, variables: Record<string, string>) => {
    const varStr = Object.values(variables).filter(Boolean).join(", ");
    addMessage(`[Template: ${templateName}] ${varStr}`, "ai", "template");
  };

  const handleSendMedia = (mediaType: "image" | "video", caption: string) => {
    addMessage(caption || `[${mediaType.toUpperCase()} sent]`, "ai", "media");
  };

  return (
    <PageContainer title="Conversations" subtitle="Chat message threads">
      <div className="flex gap-3 h-[calc(100vh-220px)] min-h-[500px]">
        <ConversationList
          conversations={conversations}
          selectedId={selectedId}
          onSelect={setSelectedId}
        />
        <ConversationThread
          conversation={selected}
          messages={currentMessages}
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
