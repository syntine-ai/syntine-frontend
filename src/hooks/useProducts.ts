/**
 * useProducts Hook
 * React Query hook for products data
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import * as ProductsService from '@/api/services/products.service';
import type { ProductListParams } from '@/api/types/products';

export function useProducts(params?: ProductListParams) {
    const { profile } = useAuth();
    const organizationId = profile?.organization_id;

    return useQuery({
        queryKey: ['products', organizationId, params],
        queryFn: () => ProductsService.listProducts(organizationId!, params),
        enabled: !!organizationId,
    });
}

export function useProduct(productId: string | null) {
    const { profile } = useAuth();
    const organizationId = profile?.organization_id;

    return useQuery({
        queryKey: ['product', organizationId, productId],
        queryFn: () => ProductsService.getProduct(organizationId!, productId!),
        enabled: !!organizationId && !!productId,
    });
}

export function useProductStats() {
    const { profile } = useAuth();
    const organizationId = profile?.organization_id;

    return useQuery({
        queryKey: ['product-stats', organizationId],
        queryFn: () => ProductsService.getProductStats(organizationId!),
        enabled: !!organizationId,
    });
}
