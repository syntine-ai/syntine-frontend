/**
 * useIntegrations Hook
 * React Query hook for commerce integrations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import * as IntegrationsService from '@/api/services/integrations.service';
import type { ShopifyConnectParams } from '@/api/types/integrations';

export function useIntegrations() {
    const { profile } = useAuth();
    const organizationId = profile?.organization_id;

    return useQuery({
        queryKey: ['integrations', organizationId],
        queryFn: () => IntegrationsService.listIntegrations(organizationId!),
        enabled: !!organizationId,
    });
}

export function useIntegration(integrationId: string | null) {
    const { profile } = useAuth();
    const organizationId = profile?.organization_id;

    return useQuery({
        queryKey: ['integration', organizationId, integrationId],
        queryFn: () => IntegrationsService.getIntegration(organizationId!, integrationId!),
        enabled: !!organizationId && !!integrationId,
    });
}

export function useConnectShopify() {
    return useMutation({
        mutationFn: (params: ShopifyConnectParams) =>
            IntegrationsService.connectShopify(params),
    });
}

export function useDisconnectIntegration() {
    const { profile } = useAuth();
    const queryClient = useQueryClient();
    const organizationId = profile?.organization_id;

    return useMutation({
        mutationFn: (integrationId: string) =>
            IntegrationsService.disconnectIntegration(organizationId!, integrationId),
        onSuccess: () => {
            // Invalidate integrations query
            queryClient.invalidateQueries({ queryKey: ['integrations', organizationId] });
        },
    });
}

export function useTriggerSync() {
    const { profile } = useAuth();
    const queryClient = useQueryClient();
    const organizationId = profile?.organization_id;

    return useMutation({
        mutationFn: (integrationId: string) =>
            IntegrationsService.triggerSync(organizationId!, integrationId),
        onSuccess: () => {
            // Invalidate integrations query
            queryClient.invalidateQueries({ queryKey: ['integrations', organizationId] });
        },
    });
}

export function useReconnectIntegration() {
    const { profile } = useAuth();
    const queryClient = useQueryClient();
    const organizationId = profile?.organization_id;

    return useMutation({
        mutationFn: ({ integrationId, shopDomain }: { integrationId: string; shopDomain?: string }) =>
            IntegrationsService.reconnectIntegration(organizationId!, integrationId, shopDomain),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['integrations', organizationId] });
        },
    });
}
