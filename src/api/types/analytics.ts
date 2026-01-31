/**
 * Analytics API Types
 * Types for dashboard analytics and outcome metrics
 */

import { Period } from './common';

// Outcome Metrics
export interface OutcomeMetrics {
    revenue_recovered: number;
    cod_confirmed: number;
    carts_recovered: number;
    rto_prevented: number;
    period: string;
}

// Call Analytics
export interface CallAnalytics {
    date: string;
    total_calls: number;
    answered: number;
    no_answer: number;
    failed: number;
    avg_duration: number;
}

export interface CallAnalyticsResponse {
    data: CallAnalytics[];
}

// Campaign Performance
export interface CampaignPerformance {
    campaign_id: string;
    campaign_name: string;
    total_calls: number;
    answered: number;
    success_rate: number;
}

export interface CampaignPerformanceResponse {
    data: CampaignPerformance[];
}

// Analytics Query Params
export interface OutcomeMetricsParams {
    period?: Period;
    date_from?: string;
    date_to?: string;
}

export interface CallAnalyticsParams {
    period?: Period;
    date_from?: string;
    date_to?: string;
    group_by?: 'day' | 'week' | 'campaign';
}

export interface CampaignPerformanceParams {
    period?: 'today' | 'week' | 'month';
}
