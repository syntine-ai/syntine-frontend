
/**
 * REST API Client
 * Simple wrapper around fetch for backend API requests
 */

import { supabase } from '@/integrations/supabase/client';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8001';

interface RequestOptions extends RequestInit {
    data?: any;
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { data, headers: customHeaders, ...customOptions } = options;

    // Get current session for auth token
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;

    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...customHeaders,
    };

    const config: RequestInit = {
        ...customOptions,
        headers,
    };

    if (data) {
        config.body = JSON.stringify(data);
    }

    const response = await fetch(`${API_URL}${endpoint}`, config);
    const responseData = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(responseData.detail || responseData.message || 'API request failed');
    }

    return responseData as T;
}

export const restClient = {
    get: <T>(endpoint: string, options?: RequestOptions) =>
        request<T>(endpoint, { ...options, method: 'GET' }),

    post: <T>(endpoint: string, data?: any, options?: RequestOptions) =>
        request<T>(endpoint, { ...options, method: 'POST', data }),

    put: <T>(endpoint: string, data?: any, options?: RequestOptions) =>
        request<T>(endpoint, { ...options, method: 'PUT', data }),

    patch: <T>(endpoint: string, data?: any, options?: RequestOptions) =>
        request<T>(endpoint, { ...options, method: 'PATCH', data }),

    delete: <T>(endpoint: string, options?: RequestOptions) =>
        request<T>(endpoint, { ...options, method: 'DELETE' }),
};
