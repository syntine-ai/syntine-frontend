import { useState } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { ConversationList } from "@/components/whatsapp/ConversationList";
import { ConversationThread } from "@/components/whatsapp/ConversationThread";
import { demoWAConversations, demoWAMessages } from "@/data/demoWhatsAppData";

export default function WhatsAppConversations() {
  const [selectedId, setSelectedId] = useState<string | null>(demoWAConversations[0]?.id || null);

  const selected = demoWAConversations.find((c) => c.id === selectedId) || null;
  const messages = selectedId ? demoWAMessages[selectedId] || [] : [];

  return (
    <PageContainer title="Conversations" subtitle="WhatsApp message threads">
      <div className="flex gap-4 h-[calc(100vh-220px)] min-h-[500px]">
        <ConversationList
          conversations={demoWAConversations}
          selectedId={selectedId}
          onSelect={setSelectedId}
        />
        <ConversationThread conversation={selected} messages={messages} />
      </div>
    </PageContainer>
  );
}
