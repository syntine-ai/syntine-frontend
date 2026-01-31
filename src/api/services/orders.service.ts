/**
 * Orders API Service
 * Service for fetching and managing orders
 */

import { supabase } from '../client/supabase.client';
import { withErrorHandling } from '../utils/error-handler';
import type {
    Order,
    OrderWithItems,
    OrderListParams,
    OrderStats,
} from '../types/orders';

/**
 * List orders with filtering and pagination
 */
export async function listOrders(
    organizationId: string,
    params?: OrderListParams
): Promise<OrderWithItems[]> {
    return withErrorHandling(async () => {
        const {
            payment_type,
            trigger_ready,
            financial_status,
            fulfillment_status,
            date_from,
            date_to,
            search,
            page = 1,
            page_size = 20,
        } = params || {};

        const offset = (page - 1) * page_size;

        // Build query
        let query = supabase
            .from('commerce_orders')
            .select(`
        *,
        commerce_order_items(*)
      `)
            .eq('organization_id', organizationId)
            .order('order_created_at', { ascending: false });

        // Apply filters
        if (payment_type) query = query.eq('payment_type', payment_type);
        if (trigger_ready) query = query.eq('trigger_ready', trigger_ready);
        if (financial_status) query = query.eq('financial_status', financial_status);
        if (fulfillment_status) query = query.eq('fulfillment_status', fulfillment_status);
        if (date_from) query = query.gte('order_created_at', date_from);
        if (date_to) query = query.lte('order_created_at', date_to);
        if (search) {
            query = query.or(`order_number.ilike.%${search}%,customer_name.ilike.%${search}%`);
        }

        // Pagination
        query = query.range(offset, offset + page_size - 1);

        const { data, error } = await query;
        if (error) throw error;

        // Transform data
        return (data || []).map((order: any) => ({
            ...order,
            items: order.commerce_order_items || [],
        }));
    }, 'listOrders');
}

/**
 * Get single order with items
 */
export async function getOrder(
    organizationId: string,
    orderId: string
): Promise<OrderWithItems> {
    return withErrorHandling(async () => {
        const { data, error } = await supabase
            .from('commerce_orders')
            .select(`
        *,
        commerce_order_items(*)
      `)
            .eq('id', orderId)
            .eq('organization_id', organizationId)
            .single();

        if (error) throw error;
        if (!data) throw new Error('Order not found');

        return {
            ...data,
            items: data.commerce_order_items || [],
        };
    }, 'getOrder');
}

/**
 * Get order statistics
 */
export async function getOrderStats(
    organizationId: string,
    params?: { date_from?: string; date_to?: string }
): Promise<OrderStats> {
    return withErrorHandling(async () => {
        let query = supabase
            .from('commerce_orders')
            .select('*')
            .eq('organization_id', organizationId);

        if (params?.date_from) query = query.gte('order_created_at', params.date_from);
        if (params?.date_to) query = query.lte('order_created_at', params.date_to);

        const { data: orders } = await query;

        const totalOrders = orders?.length || 0;
        const codOrders = orders?.filter((o) => o.payment_type === 'cod').length || 0;
        const triggerReady = orders?.filter((o) => o.trigger_ready === 'ready').length || 0;
        const totalRevenue = orders?.reduce((sum, o) => sum + (o.total_amount || 0), 0) || 0;

        return {
            total_orders: totalOrders,
            cod_orders: codOrders,
            prepaid_orders: totalOrders - codOrders,
            trigger_ready: triggerReady,
            total_revenue: totalRevenue,
        };
    }, 'getOrderStats');
}
