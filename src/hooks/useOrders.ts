/**
 * useOrders Hook
 * React Query hook for orders data
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import * as OrdersService from '@/api/services/orders.service';
import type { OrderListParams, CreateOrderData } from '@/api/types/orders';

export function useOrders(params?: OrderListParams) {
    const { profile } = useAuth();
    const organizationId = profile?.organization_id;

    return useQuery({
        queryKey: ['orders', organizationId, params],
        queryFn: () => OrdersService.listOrders(organizationId!, params),
        enabled: !!organizationId,
    });
}

export function useOrder(orderId: string | null) {
    const { profile } = useAuth();
    const organizationId = profile?.organization_id;

    return useQuery({
        queryKey: ['order', organizationId, orderId],
        queryFn: () => OrdersService.getOrder(organizationId!, orderId!),
        enabled: !!organizationId && !!orderId,
    });
}

export function useOrderStats(params?: { date_from?: string; date_to?: string }) {
    const { profile } = useAuth();
    const organizationId = profile?.organization_id;

    return useQuery({
        queryKey: ['order-stats', organizationId, params],
        queryFn: () => OrdersService.getOrderStats(organizationId!, params),
        enabled: !!organizationId,
    });
}

export function useCreateOrder() {
    const { profile } = useAuth();
    const organizationId = profile?.organization_id;
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateOrderData) => 
            OrdersService.createOrder(organizationId!, data),
        onSuccess: () => {
            // Invalidate orders queries to refresh the list
            queryClient.invalidateQueries({ queryKey: ['orders', organizationId] });
            queryClient.invalidateQueries({ queryKey: ['order-stats', organizationId] });
        },
    });
}
