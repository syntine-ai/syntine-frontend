/**
 * Products API Types
 */

import { ProductStatus, CommerceSource } from './commerce-common';

export interface ProductVariant {
    id: string;
    product_id: string;
    external_variant_id?: string;
    title?: string;
    sku?: string;
    price?: number;
    compare_at_price?: number;
    inventory_quantity?: number;
    requires_shipping: boolean;
    weight?: number;
    weight_unit?: string;
}

export interface Product {
    id: string;
    organization_id: string;
    integration_id?: string;
    external_product_id?: string;
    source: CommerceSource;
    title: string;
    description?: string;
    vendor?: string;
    product_type?: string;
    status: ProductStatus;
    images?: string[];
    tags?: string[];
    synced_at?: string;
    created_at: string;
    updated_at: string;
}

export interface ProductWithVariants extends Product {
    variants: ProductVariant[];
}

// Query params
export interface ProductListParams {
    status?: ProductStatus;
    product_type?: string;
    search?: string;
    page?: number;
    page_size?: number;
}

export interface ProductStats {
    total_products: number;
    active_products: number;
    draft_products: number;
}
