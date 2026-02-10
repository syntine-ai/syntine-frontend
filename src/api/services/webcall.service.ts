/**
 * WebCall API Service
 * Service for creating browser-based web calls via LiveKit
 */

import { restClient } from '@/api/client/rest.client';

interface WebCallResponse {
    success: boolean;
    message: string;
    data: {
        call_uuid: string;
        room_name: string;
        token: string;
        url: string;
    };
}

/**
 * Create a web call session for browser-based voice testing.
 * Returns LiveKit connection details (token, URL, room).
 */
export async function createWebCall(
    agentId: string,
    variableOverrides?: Record<string, string>
): Promise<WebCallResponse> {
    return restClient.post<WebCallResponse>('/calls/web', {
        agent_id: agentId,
        variable_overrides: variableOverrides || undefined,
    });
}
