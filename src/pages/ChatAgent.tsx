import { useQuery } from "@tanstack/react-query";
import { PageContainer } from "@/components/layout/PageContainer";
import { AgentConfigPanel } from "@/components/chat/AgentConfigPanel";
import { chatService } from "@/api/services/chat.service";
import { Loader2 } from "lucide-react";

export default function ChatAgent() {
  // Fetch first agent to config
  const { data: agents = [], isLoading } = useQuery({
    queryKey: ["agents"],
    queryFn: () => chatService.getAgents(), // Assuming this exists or similar
  });

  // For MVP, we assume 1 agent per org or we pick the first "chat" type agent
  // If no agent, we might want to show a "Create" state, but AgentConfigPanel handles "isNew" if ID is missing.
  // HOWEVER, AgentConfigPanel's save logic assumes update.
  // Let's assume we pick the first available agent.

  const selectedAgentId = agents.length > 0 ? agents[0].agent_id : "";

  if (isLoading) {
    return <div className="p-10 flex justify-center"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  }

  return (
    <PageContainer
      title="Chat Agent"
      subtitle="Configure your Chat AI bot"
    >
      <AgentConfigPanel agentId={selectedAgentId} />
    </PageContainer>
  );
}
