import { restClient } from '../client/rest.client';
import type { ApiKeyResponse, Organization } from '../types/organization';

export const organizationService = {
    getApiKey: async (organizationId: string): Promise<ApiKeyResponse> => {
        return restClient.get<ApiKeyResponse>(`/api/v1/organizations/${organizationId}/api-key`);
    },

    rotateApiKey: async (organizationId: string): Promise<ApiKeyResponse> => {
        return restClient.post<ApiKeyResponse>(`/api/v1/organizations/${organizationId}/api-key/rotate`);
    },

    getOrganization: async (organizationId: string): Promise<Organization> => {
        return restClient.get<Organization>(`/api/v1/organizations/${organizationId}`);
    }
};
