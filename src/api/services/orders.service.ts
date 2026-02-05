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
    CreateOrderData,
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

        // Transform data with type safety
        return (data || []).map((order: any) => ({
            ...order,
            shipping_address: (order.shipping_address as Record<string, any>) || undefined,
            billing_address: (order.billing_address as Record<string, any>) || undefined,
            tags: Array.isArray(order.tags) ? order.tags : [],
            items: order.commerce_order_items || [],
        })) as OrderWithItems[];
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
            shipping_address: (data.shipping_address as Record<string, any>) || undefined,
            billing_address: (data.billing_address as Record<string, any>) || undefined,
            tags: Array.isArray(data.tags) ? data.tags : [],
            items: data.commerce_order_items || [],
        } as OrderWithItems;
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

/**
 * Create a manual order
 */
export async function createOrder(
    organizationId: string,
    orderData: CreateOrderData
): Promise<OrderWithItems> {
    return withErrorHandling(async () => {
        // Generate a unique order number for manual orders
        const orderNumber = `M-${Date.now().toString(36).toUpperCase()}`;
        const externalOrderId = `manual_${crypto.randomUUID()}`;

        // Determine trigger_ready status based on payment type and phone
        const triggerReady = orderData.payment_type === 'cod' && orderData.customer_phone
            ? 'ready'
            : orderData.payment_type === 'prepaid'
                ? 'not_applicable'
                : 'missing_phone';

        // Create order
        const { data: order, error: orderError } = await supabase
            .from('commerce_orders')
            .insert({
                organization_id: organizationId,
                external_order_id: externalOrderId,
                order_number: orderNumber,
                source: 'custom_webhook', // Manual orders use custom_webhook source
                integration_id: null, // No integration for manual orders
                customer_name: orderData.customer_name,
                customer_phone: orderData.customer_phone,
                customer_email: orderData.customer_email,
                payment_type: orderData.payment_type,
                financial_status: orderData.payment_type === 'prepaid' ? 'paid' : 'pending',
                fulfillment_status: 'unfulfilled',
                trigger_ready: triggerReady,
                total_amount: orderData.total_amount,
                subtotal: orderData.subtotal,
                currency: orderData.currency || 'INR',
                items_count: orderData.items.length,
                notes: orderData.notes,
                order_created_at: new Date().toISOString(),
            })
            .select()
            .single();

        if (orderError) throw orderError;

        // Create order items
        if (orderData.items.length > 0) {
            const { error: itemsError } = await supabase
                .from('commerce_order_items')
                .insert(
                    orderData.items.map((item) => ({
                        order_id: order.id,
                        product_id: item.product_id,
                        variant_id: item.variant_id,
                        title: item.title,
                        variant_title: item.variant_title,
                        sku: item.sku,
                        quantity: item.quantity,
                        price: item.price,
                        total: item.total,
                    }))
                );

            if (itemsError) throw itemsError;
        }

        // Fetch the complete order with items
        return getOrder(organizationId, order.id);
    }, 'createOrder');
}

/**
 * Manually trigger a call for an order
 */
export async function triggerOrderCall(
    organizationId: string,
    orderId: string
): Promise<{ success: boolean; message: string }> {
    return withErrorHandling(async () => {
        // For now, throw a meaningful error since the backend API is not yet implemented
        // This will be connected to the FastAPI backend trigger endpoint
        throw new Error("Trigger call implementation pending backend API integration");
    }, 'triggerOrderCall');
}
