/**
 * Calls API Service
 * Service for making test calls via backend API
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8003';

interface TestCallResponse {
    success: boolean;
    message: string;
    data: {
        call_id: string;
        phone_number: string;
        agent_id: string | null;
    };
}

/**
 * Make a test call to a phone number using an agent
 */
export async function makeTestCall(
    agentId: string,
    phoneNumber: string
): Promise<TestCallResponse> {
    const response = await fetch(`${API_BASE_URL}/calls/test`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            phone_number: phoneNumber,
            agent_id: agentId,
        }),
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'Failed to make test call' }));
        throw new Error(error.detail || 'Failed to make test call');
    }

    return response.json();
}
