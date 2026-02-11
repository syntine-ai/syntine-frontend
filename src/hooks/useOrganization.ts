import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { organizationService } from '@/api/services/organization.service';

export function useOrganizationApiKey() {
    const { profile } = useAuth();
    const organizationId = profile?.organization_id;

    return useQuery({
        queryKey: ['organizationApiKey', organizationId],
        queryFn: () => organizationService.getApiKey(organizationId!),
        enabled: !!organizationId,
    });
}

export function useRotateApiKey() {
    const { profile } = useAuth();
    const queryClient = useQueryClient();
    const organizationId = profile?.organization_id;

    return useMutation({
        mutationFn: () => organizationService.rotateApiKey(organizationId!),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['organizationApiKey', organizationId] });
        }
    });
}
