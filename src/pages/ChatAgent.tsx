import { PageContainer } from "@/components/layout/PageContainer";
import { ChatAgentConfigPanel } from "@/components/chat/AgentConfigPanel";

export default function ChatAgent() {
  return (
    <PageContainer
      title="Chat Agent"
      subtitle="Configure your Chat AI bot"
    >
      <ChatAgentConfigPanel />
    </PageContainer>
  );
}
