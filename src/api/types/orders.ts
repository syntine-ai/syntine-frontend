/**
 * Orders API Types
 */

import {
    PaymentType,
    OrderFinancialStatus,
    OrderFulfillmentStatus,
    TriggerReadyStatus,
    CommerceSource,
} from './commerce-common';

export interface OrderItem {
    id: string;
    order_id: string;
    product_id?: string;
    variant_id?: string;
    title: string;
    variant_title?: string;
    sku?: string;
    quantity: number;
    price: number;
    total: number;
}

export interface Order {
    id: string;
    organization_id: string;
    integration_id?: string;
    external_order_id?: string;
    order_number: string;
    source: CommerceSource;
    customer_id?: string;
    customer_name?: string;
    customer_email?: string;
    customer_phone?: string;
    total_amount: number;
    subtotal?: number;
    total_tax?: number;
    total_discounts?: number;
    currency: string;
    payment_type: PaymentType;
    financial_status: OrderFinancialStatus;
    fulfillment_status: OrderFulfillmentStatus;
    trigger_ready: TriggerReadyStatus;
    shipping_address?: Record<string, any>;
    billing_address?: Record<string, any>;
    items_count?: number;
    notes?: string;
    tags?: string[];
    order_created_at?: string;
    call_enqueued_at?: string;
    synced_at?: string;
    created_at: string;
    updated_at: string;
}

export interface OrderWithItems extends Order {
    items: OrderItem[];
}

// Query params
export interface OrderListParams {
    payment_type?: PaymentType;
    trigger_ready?: TriggerReadyStatus;
    financial_status?: OrderFinancialStatus;
    fulfillment_status?: OrderFulfillmentStatus;
    date_from?: string;
    date_to?: string;
    search?: string;
    page?: number;
    page_size?: number;
}

export interface OrderStats {
    total_orders: number;
    cod_orders: number;
    prepaid_orders: number;
    trigger_ready: number;
    total_revenue: number;
}

// Create order data for manual orders
export interface CreateOrderData {
    customer_name: string;
    customer_phone: string;
    customer_email?: string;
    payment_type: PaymentType;
    notes?: string;
    items: {
        product_id: string;
        variant_id: string;
        title: string;
        variant_title?: string;
        sku?: string;
        quantity: number;
        price: number;
        total: number;
    }[];
    total_amount: number;
    subtotal: number;
    currency: string;
}
