/**
 * useAbandonedCarts Hook
 * React Query hook for abandoned carts data
 */

import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import * as CartsService from '@/api/services/carts.service';
import type { CartListParams } from '@/api/types/carts';

export function useAbandonedCarts(params?: CartListParams) {
    const { profile } = useAuth();
    const organizationId = profile?.organization_id;

    return useQuery({
        queryKey: ['abandoned-carts', organizationId, params],
        queryFn: () => CartsService.listAbandonedCarts(organizationId!, params),
        enabled: !!organizationId,
    });
}

export function useAbandonedCart(cartId: string | null) {
    const { profile } = useAuth();
    const organizationId = profile?.organization_id;

    return useQuery({
        queryKey: ['abandoned-cart', organizationId, cartId],
        queryFn: () => CartsService.getAbandonedCart(organizationId!, cartId!),
        enabled: !!organizationId && !!cartId,
    });
}

export function useCartStats(params?: { date_from?: string; date_to?: string }) {
    const { profile } = useAuth();
    const organizationId = profile?.organization_id;

    return useQuery({
        queryKey: ['cart-stats', organizationId, params],
        queryFn: () => CartsService.getCartStats(organizationId!, params),
        enabled: !!organizationId,
    });
}
