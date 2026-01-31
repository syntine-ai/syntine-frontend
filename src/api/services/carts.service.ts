/**
 * Abandoned Carts API Service
 * Service for fetching and managing abandoned carts
 */

import { supabase } from '../client/supabase.client';
import { withErrorHandling } from '../utils/error-handler';
import type {
    AbandonedCart,
    AbandonedCartWithItems,
    CartListParams,
    CartStats,
} from '../types/carts';

/**
 * List abandoned carts with filtering and pagination
 */
export async function listAbandonedCarts(
    organizationId: string,
    params?: CartListParams
): Promise<AbandonedCartWithItems[]> {
    return withErrorHandling(async () => {
        const {
            status,
            trigger_ready,
            date_from,
            date_to,
            min_value,
            search,
            page = 1,
            page_size = 20,
        } = params || {};

        const offset = (page - 1) * page_size;

        // Build query
        let query = supabase
            .from('commerce_abandoned_carts')
            .select(`
        *,
        commerce_cart_items(*)
      `)
            .eq('organization_id', organizationId)
            .order('abandoned_at', { ascending: false });

        // Apply filters
        if (status) query = query.eq('status', status);
        if (trigger_ready) query = query.eq('trigger_ready', trigger_ready);
        if (date_from) query = query.gte('abandoned_at', date_from);
        if (date_to) query = query.lte('abandoned_at', date_to);
        if (min_value !== undefined) query = query.gte('total_value', min_value);
        if (search) {
            query = query.or(`customer_name.ilike.%${search}%,customer_email.ilike.%${search}%`);
        }

        // Pagination
        query = query.range(offset, offset + page_size - 1);

        const { data, error } = await query;
        if (error) throw error;

        // Transform data
        return (data || []).map((cart: any) => ({
            ...cart,
            items: cart.commerce_cart_items || [],
        }));
    }, 'listAbandonedCarts');
}

/**
 * Get single abandoned cart with items
 */
export async function getAbandonedCart(
    organizationId: string,
    cartId: string
): Promise<AbandonedCartWithItems> {
    return withErrorHandling(async () => {
        const { data, error } = await supabase
            .from('commerce_abandoned_carts')
            .select(`
        *,
        commerce_cart_items(*)
      `)
            .eq('id', cartId)
            .eq('organization_id', organizationId)
            .single();

        if (error) throw error;
        if (!data) throw new Error('Abandoned cart not found');

        return {
            ...data,
            items: data.commerce_cart_items || [],
        };
    }, 'getAbandonedCart');
}

/**
 * Get cart statistics
 */
export async function getCartStats(
    organizationId: string,
    params?: { date_from?: string; date_to?: string }
): Promise<CartStats> {
    return withErrorHandling(async () => {
        let query = supabase
            .from('commerce_abandoned_carts')
            .select('*')
            .eq('organization_id', organizationId);

        if (params?.date_from) query = query.gte('abandoned_at', params.date_from);
        if (params?.date_to) query = query.lte('abandoned_at', params.date_to);

        const { data: carts } = await query;

        const totalAbandoned = carts?.length || 0;
        const abandonedCarts = carts?.filter((c) => c.status === 'abandoned').length || 0;
        const recoveredCarts = carts?.filter((c) => c.status === 'recovered').length || 0;
        const triggerReady = carts?.filter((c) => c.trigger_ready === 'ready').length || 0;
        const totalValue = carts
            ?.filter((c) => c.status === 'abandoned')
            .reduce((sum, c) => sum + (c.total_value || 0), 0) || 0;
        const recoveredValue = carts
            ?.filter((c) => c.status === 'recovered')
            .reduce((sum, c) => sum + (c.total_value || 0), 0) || 0;
        const recoveryRate = totalAbandoned > 0 ? (recoveredCarts / totalAbandoned) * 100 : 0;

        return {
            total_abandoned: totalAbandoned,
            abandoned_carts: abandonedCarts,
            recovered_carts: recoveredCarts,
            trigger_ready: triggerReady,
            total_value: totalValue,
            recovered_value: recoveredValue,
            recovery_rate: recoveryRate,
        };
    }, 'getCartStats');
}
