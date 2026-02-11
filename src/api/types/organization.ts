export interface ApiKeyResponse {
    success: boolean;
    message: string;
    data: {
        api_key: string;
    };
}

export interface Organization {
    id: string;
    name: string;
    domain?: string;
    email?: string;
    plan: string;
    status: string;
    settings?: Record<string, any>;
    created_at: string;
}
