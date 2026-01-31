/**
 * Integrations API Service
 * Service for managing commerce platform integrations
 */

import { supabase } from '../client/supabase.client';
import { withErrorHandling } from '../utils/error-handler';
import type {
    Integration,
    ShopifyConnectParams,
    ShopifyConnectResponse,
} from '../types/integrations';
import type { SuccessResponse } from '../types/common';

/**
 * List all integrations for organization
 */
export async function listIntegrations(
    organizationId: string
): Promise<Integration[]> {
    return withErrorHandling(async () => {
        const { data, error } = await supabase
            .from('commerce_integrations')
            .select('*')
            .eq('organization_id', organizationId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        
        // Transform to ensure type compatibility
        return (data || []).map(item => ({
            ...item,
            settings: (item.settings as Record<string, any>) || {},
        })) as Integration[];
    }, 'listIntegrations');
}

/**
 * Get single integration
 */
export async function getIntegration(
    organizationId: string,
    integrationId: string
): Promise<Integration> {
    return withErrorHandling(async () => {
        const { data, error } = await supabase
            .from('commerce_integrations')
            .select('*')
            .eq('id', integrationId)
            .eq('organization_id', organizationId)
            .single();

        if (error) throw error;
        if (!data) throw new Error('Integration not found');

        return {
            ...data,
            settings: (data.settings as Record<string, any>) || {},
        } as Integration;
    }, 'getIntegration');
}

/**
 * Initiate Shopify OAuth connection
 * NOTE: This is a placeholder. Full implementation requires backend OAuth flow.
 */
export async function connectShopify(
    params: ShopifyConnectParams
): Promise<ShopifyConnectResponse> {
    return withErrorHandling(async () => {
        // TODO: Call backend endpoint when OAuth is implemented
        // For now, return placeholder
        return {
            success: true,
            oauth_url: `https://${params.shop_domain}/admin/oauth/authorize`,
            message: 'Shopify OAuth flow not yet implemented. This is a placeholder.',
        };
    }, 'connectShopify');
}

/**
 * Disconnect an integration
 */
export async function disconnectIntegration(
    organizationId: string,
    integrationId: string
): Promise<SuccessResponse> {
    return withErrorHandling(async () => {
        // Update status to disconnected
        const { error } = await supabase
            .from('commerce_integrations')
            .update({ status: 'disconnected' })
            .eq('id', integrationId)
            .eq('organization_id', organizationId);

        if (error) throw error;

        return {
            success: true,
            message: 'Integration disconnected successfully',
        };
    }, 'disconnectIntegration');
}

/**
 * Trigger manual sync for an integration
 * NOTE: This is a placeholder. Full implementation requires backend sync logic.
 */
export async function triggerSync(
    organizationId: string,
    integrationId: string
): Promise<SuccessResponse> {
    return withErrorHandling(async () => {
        // Verify integration exists
        const { data: integration } = await supabase
            .from('commerce_integrations')
            .select('status')
            .eq('id', integrationId)
            .eq('organization_id', organizationId)
            .single();

        if (!integration) {
            throw new Error('Integration not found');
        }

        if (integration.status !== 'connected') {
            throw new Error('Integration is not connected');
        }

        // TODO: Call backend sync endpoint when implemented
        // For now, just update last_sync_at
        const { error } = await supabase
            .from('commerce_integrations')
            .update({ last_sync_at: new Date().toISOString() })
            .eq('id', integrationId);

        if (error) throw error;

        return {
            success: true,
            message: 'Sync initiated successfully. Full sync implementation pending.',
        };
    }, 'triggerSync');
}
