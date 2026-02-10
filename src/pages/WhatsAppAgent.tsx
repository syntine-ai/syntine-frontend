import { PageContainer } from "@/components/layout/PageContainer";
import { WhatsAppAgentConfigPanel } from "@/components/whatsapp/AgentConfigPanel";

export default function WhatsAppAgent() {
  return (
    <PageContainer
      title="WhatsApp Agent"
      subtitle="Configure your WhatsApp AI bot"
    >
      <WhatsAppAgentConfigPanel />
    </PageContainer>
  );
}
