/**
 * Abandoned Carts API Types
 */

import {
    CartStatus,
    TriggerReadyStatus,
    CommerceSource,
} from './commerce-common';

export interface CartItem {
    id: string;
    cart_id: string;
    product_id?: string;
    variant_id?: string;
    title: string;
    variant_title?: string;
    quantity: number;
    price: number;
    total: number;
    image_url?: string;
}

export interface AbandonedCart {
    id: string;
    organization_id: string;
    integration_id?: string;
    external_cart_id?: string;
    source: CommerceSource;
    customer_id?: string;
    customer_name?: string;
    customer_email?: string;
    customer_phone?: string;
    total_value: number;
    currency: string;
    items_count: number;
    status: CartStatus;
    trigger_ready: TriggerReadyStatus;
    recovery_url?: string;
    abandoned_at?: string;
    synced_at?: string;
    created_at: string;
    updated_at: string;
}

export interface AbandonedCartWithItems extends AbandonedCart {
    items: CartItem[];
}

// Query params
export interface CartListParams {
    status?: CartStatus;
    trigger_ready?: TriggerReadyStatus;
    date_from?: string;
    date_to?: string;
    min_value?: number;
    search?: string;
    page?: number;
    page_size?: number;
}

export interface CartStats {
    total_abandoned: number;
    abandoned_carts: number;
    recovered_carts: number;
    trigger_ready: number;
    total_value: number;
    recovered_value: number;
    recovery_rate: number;
}
