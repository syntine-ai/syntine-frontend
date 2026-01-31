/**
 * Products API Service
 * Service for fetching and managing products
 */

import { supabase } from '../client/supabase.client';
import { withErrorHandling } from '../utils/error-handler';
import type {
    Product,
    ProductWithVariants,
    ProductListParams,
    ProductStats,
} from '../types/products';

/**
 * List products with filtering and pagination
 */
export async function listProducts(
    organizationId: string,
    params?: ProductListParams
): Promise<ProductWithVariants[]> {
    return withErrorHandling(async () => {
        const {
            status,
            product_type,
            search,
            page = 1,
            page_size = 20,
        } = params || {};

        const offset = (page - 1) * page_size;

        // Build query
        let query = supabase
            .from('commerce_products')
            .select(`
        *,
        commerce_product_variants(*)
      `)
            .eq('organization_id', organizationId)
            .order('updated_at', { ascending: false });

        // Apply filters
        if (status) query = query.eq('status', status);
        if (product_type) query = query.eq('product_type', product_type);
        if (search) query = query.ilike('title', `%${search}%`);

        // Pagination
        query = query.range(offset, offset + page_size - 1);

        const { data, error } = await query;
        if (error) throw error;

        // Transform data
        return (data || []).map((product: any) => ({
            ...product,
            variants: product.commerce_product_variants || [],
        }));
    }, 'listProducts');
}

/**
 * Get single product with variants
 */
export async function getProduct(
    organizationId: string,
    productId: string
): Promise<ProductWithVariants> {
    return withErrorHandling(async () => {
        const { data, error } = await supabase
            .from('commerce_products')
            .select(`
        *,
        commerce_product_variants(*)
      `)
            .eq('id', productId)
            .eq('organization_id', organizationId)
            .single();

        if (error) throw error;
        if (!data) throw new Error('Product not found');

        return {
            ...data,
            variants: data.commerce_product_variants || [],
        };
    }, 'getProduct');
}

/**
 * Get product statistics
 */
export async function getProductStats(
    organizationId: string
): Promise<ProductStats> {
    return withErrorHandling(async () => {
        // Total products
        const { count: totalCount } = await supabase
            .from('commerce_products')
            .select('id', { count: 'exact', head: true })
            .eq('organization_id', organizationId);

        // Active products
        const { count: activeCount } = await supabase
            .from('commerce_products')
            .select('id', { count: 'exact', head: true })
            .eq('organization_id', organizationId)
            .eq('status', 'active');

        return {
            total_products: totalCount || 0,
            active_products: activeCount || 0,
            draft_products: (totalCount || 0) - (activeCount || 0),
        };
    }, 'getProductStats');
}
