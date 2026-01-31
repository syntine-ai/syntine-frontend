/**
 * Integrations API Types
 */

import {
    IntegrationStatus,
    WebhookStatus,
    CommerceSource,
} from './commerce-common';

export interface Integration {
    id: string;
    organization_id: string;
    source: CommerceSource;
    status: IntegrationStatus;
    store_name?: string;
    store_domain?: string;
    external_store_id?: string;
    webhook_status: WebhookStatus;
    settings?: Record<string, any>;
    last_sync_at?: string;
    last_products_sync_at?: string;
    last_orders_sync_at?: string;
    created_at: string;
    updated_at: string;
}

export interface ShopifyConnectParams {
    shop_domain: string;
}

export interface ShopifyConnectResponse {
    success: boolean;
    oauth_url: string;
    message: string;
}
