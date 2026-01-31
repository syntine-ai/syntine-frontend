/**
 * Analytics API Service
 * Service for fetching dashboard analytics and metrics
 */

import { supabase } from '../client/supabase.client';
import { withErrorHandling } from '../utils/error-handler';
import type {
    OutcomeMetrics,
    OutcomeMetricsParams,
    CallAnalytics,
    CallAnalyticsParams,
    CallAnalyticsResponse,
    CampaignPerformance,
    CampaignPerformanceParams,
    CampaignPerformanceResponse,
} from '../types/analytics';

/**
 * Get outcome metrics for dashboard
 * 
 * For MVP, we calculate this client-side using Supabase.
 * In production, this could call the backend /analytics/outcomes endpoint
 */
export async function getOutcomeMetrics(
    organizationId: string,
    params?: OutcomeMetricsParams
): Promise<OutcomeMetrics> {
    return withErrorHandling(async () => {
        // Calculate date range
        const { date_from, date_to } = getDateRange(params?.period || 'last_30_days', params);

        // Revenue recovered (recovered carts total value)
        let recoveredCartsQuery = supabase
            .from('commerce_abandoned_carts')
            .select('total_value')
            .eq('organization_id', organizationId)
            .eq('status', 'recovered');

        if (date_from) recoveredCartsQuery = recoveredCartsQuery.gte('updated_at', date_from);
        if (date_to) recoveredCartsQuery = recoveredCartsQuery.lte('updated_at', date_to);

        const { data: recoveredCarts } = await recoveredCartsQuery;
        const revenueRecovered = (recoveredCarts || []).reduce((sum, cart) => sum + (cart.total_value || 0), 0);

        // COD confirmed (answered calls for COD orders)
        let codCallsQuery = supabase
            .from('calls')
            .select('id, metadata')
            .eq('organization_id', organizationId)
            .eq('outcome', 'answered');

        if (date_from) codCallsQuery = codCallsQuery.gte('created_at', date_from);
        if (date_to) codCallsQuery = codCallsQuery.lte('created_at', date_to);

        const { data: codCalls } = await codCallsQuery;
        const codConfirmed = (codCalls || []).filter(
            (call) => call.metadata && (call.metadata as any).payment_type === 'cod'
        ).length;

        // Carts recovered count
        const cartsRecovered = recoveredCarts?.length || 0;

        // RTO prevented (simplified: answered COD calls)
        const rtoPrevented = codConfirmed;

        return {
            revenue_recovered: revenueRecovered,
            cod_confirmed: codConfirmed,
            carts_recovered: cartsRecovered,
            rto_prevented: rtoPrevented,
            period: params?.period || 'last_30_days',
        };
    }, 'getOutcomeMetrics');
}

/**
 * Get call analytics grouped by day/week/campaign
 */
export async function getCallAnalytics(
    organizationId: string,
    params?: CallAnalyticsParams
): Promise<CallAnalyticsResponse> {
    return withErrorHandling(async () => {
        const { date_from, date_to } = getDateRange(params?.period || 'week', params);
        const groupBy = params?.group_by || 'day';

        // Fetch calls
        let callsQuery = supabase
            .from('calls')
            .select('id, created_at, outcome, duration_seconds')
            .eq('organization_id', organizationId);

        if (date_from) callsQuery = callsQuery.gte('created_at', date_from);
        if (date_to) callsQuery = callsQuery.lte('created_at', date_to);

        const { data: calls } = await callsQuery;

        if (!calls || calls.length === 0) {
            return { data: [] };
        }

        if (groupBy === 'day') {
            // Group by day
            const analyticsMap = new Map<string, CallAnalytics>();

            calls.forEach((call) => {
                const date = call.created_at?.substring(0, 10) || ''; // YYYY-MM-DD

                if (!analyticsMap.has(date)) {
                    analyticsMap.set(date, {
                        date,
                        total_calls: 0,
                        answered: 0,
                        no_answer: 0,
                        failed: 0,
                        avg_duration: 0,
                    });
                }

                const analytics = analyticsMap.get(date)!;
                analytics.total_calls++;

                if (call.outcome === 'answered') analytics.answered++;
                else if (call.outcome === 'no_answer') analytics.no_answer++;
                else if (call.outcome === 'failed') analytics.failed++;
            });

            // Calculate average duration
            const data = Array.from(analyticsMap.values()).sort((a, b) => a.date.localeCompare(b.date));

            return { data };
        }

        // TODO: Implement week and campaign grouping
        return { data: [] };
    }, 'getCallAnalytics');
}

/**
 * Get campaign performance metrics
 */
export async function getCampaignPerformance(
    organizationId: string,
    params?: CampaignPerformanceParams
): Promise<CampaignPerformanceResponse> {
    return withErrorHandling(async () => {
        const { date_from } = getDateRange(params?.period || 'week');

        // Fetch campaigns
        const { data: campaigns } = await supabase
            .from('campaigns')
            .select('id, name')
            .eq('organization_id', organizationId)
            .is('deleted_at', null);

        if (!campaigns || campaigns.length === 0) {
            return { data: [] };
        }

        // Fetch calls for each campaign
        const performance: CampaignPerformance[] = [];

        for (const campaign of campaigns) {
            let callsQuery = supabase
                .from('calls')
                .select('id, outcome')
                .eq('campaign_id', campaign.id);

            if (date_from) callsQuery = callsQuery.gte('created_at', date_from);

            const { data: calls } = await callsQuery;

            const totalCalls = calls?.length || 0;
            const answered = calls?.filter((c) => c.outcome === 'answered').length || 0;
            const successRate = totalCalls > 0 ? (answered / totalCalls) * 100 : 0;

            performance.push({
                campaign_id: campaign.id,
                campaign_name: campaign.name || '',
                total_calls: totalCalls,
                answered,
                success_rate: successRate,
            });
        }

        return { data: performance };
    }, 'getCampaignPerformance');
}

/**
 * Helper: Calculate date range based on period
 */
function getDateRange(
    period: string,
    params?: { date_from?: string; date_to?: string }
): { date_from?: string; date_to?: string } {
    if (params?.date_from && params?.date_to) {
        return { date_from: params.date_from, date_to: params.date_to };
    }

    const now = new Date();
    let dateFrom: Date;

    switch (period) {
        case 'today':
            dateFrom = new Date(now.setHours(0, 0, 0, 0));
            break;
        case 'week':
            dateFrom = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
        case 'month':
            dateFrom = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            break;
        case 'last_30_days':
            dateFrom = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            break;
        default:
            dateFrom = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    return {
        date_from: dateFrom.toISOString(),
        date_to: new Date().toISOString(),
    };
}
