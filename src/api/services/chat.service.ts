import { restClient } from "@/api/client/rest.client";

export interface ChatSession {
    id: string;
    organization_id: string;
    agent_config_id?: string;
    external_id?: string; // Phone number or user ID
    channel: "whatsapp" | "web";
    status: "active" | "closed" | "human_handover";
    conversation_summary?: string;
    message_count: number;
    last_message_at?: string;
    metadata: Record<string, any>;
    created_at: string;
}

export interface ChatMessage {
    id: string;
    session_id: string;
    sender: "user" | "ai" | "human_agent" | "system";
    content: string;
    message_type: "text" | "template" | "media";
    metadata: Record<string, any>;
    created_at: string;
    status?: "sent" | "delivered" | "read"; // Frontend helper
}

export interface ChatAgentConfig {
    id: string;
    agent_id: string;
    organization_id: string;
    agent_name: string;
    agent_status: string;
    system_prompt: string | null;
    custom_system_prefix: string | null;
    greeting_message: string | null;
    fallback_message_web: string | null;
    fallback_message_wa: string | null;
    use_summary: boolean;
    enabled_templates: boolean;
    version: number;
    created_at: string;
    updated_at: string;
}

export const chatService = {
    getSessions: async (filters?: { status?: string; agent_id?: string; limit?: number; offset?: number }) => {
        const params = new URLSearchParams();
        if (filters?.status) params.append("status", filters.status);
        if (filters?.agent_id) params.append("agent_id", filters.agent_id);
        if (filters?.limit) params.append("limit", filters.limit.toString());
        if (filters?.offset) params.append("offset", filters.offset.toString());

        return restClient.get<ChatSession[]>(`/chat/sessions?${params.toString()}`);
    },

    getSessionMessages: async (sessionId: string) => {
        return restClient.get<ChatMessage[]>(`/chat/sessions/${sessionId}/messages`);
    },

    sendHumanReply: async (sessionId: string, content: string) => {
        return restClient.post(`/chat/sessions/${sessionId}/reply`, { content });
    },

    updateSessionStatus: async (sessionId: string, status: "active" | "closed" | "human_handover", assignedTo?: string | null) => {
        return restClient.post(`/chat/sessions/${sessionId}/status`, { status, assigned_to: assignedTo });
    },

    getTemplates: async () => {
        return restClient.get("/chat/templates");
    },

    sendTemplate: async (sessionId: string, templateName: string, variables: Record<string, any>) => {
        return restClient.post(`/chat/sessions/${sessionId}/send-template`, {
            template_name: templateName,
            variables
        });
    },

    getAgents: async () => {
        return restClient.get("/chat/config/agents");
    },

    getAgentConfig: async (agentId: string) => {
        return restClient.get<ChatAgentConfig>(`/chat/config/${agentId}`);
    },

    updateAgentConfig: async (agentId: string, data: any) => {
        if (!agentId) {
            return restClient.post("/chat/config", data);
        }
        return restClient.put(`/chat/config/${agentId}`, data);
    }
};

