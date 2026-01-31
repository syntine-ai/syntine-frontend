/**
 * Common API Types
 * Shared types used across all API modules
 */

// Pagination
export interface PaginationParams {
    page: number;
    limit: number;
    sort?: string;
    order?: 'asc' | 'desc';
}

export interface PaginationResponse {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
}

export interface PaginatedApiResponse<T> {
    data: T[];
    pagination: PaginationResponse;
}

// Standard API Responses
export interface ApiResponse<T> {
    data: T;
    pagination?: PaginationResponse;
}

export interface ApiError {
    code: string;
    message: string;
    details?: Record<string, any>;
}

export interface SuccessResponse {
    success: boolean;
    message: string;
    data?: any;
}

// Date Range Filters
export interface DateRangeFilter {
    date_from?: string;
    date_to?: string;
}

// Period Filters
export type Period = 'today' | 'week' | 'month' | 'last_30_days' | 'custom';

export interface PeriodFilter {
    period?: Period;
    date_from?: string;
    date_to?: string;
}

// Search Filter
export interface SearchFilter {
    search?: string;
}

// Common Error Types
export class ApiException extends Error {
    constructor(
        public code: string,
        message: string,
        public details?: Record<string, any>,
        public statusCode?: number
    ) {
        super(message);
        this.name = 'ApiException';
    }
}

// Response helpers
export function isSuccessResponse(response: any): response is SuccessResponse {
    return response && typeof response.success === 'boolean';
}

export function isApiError(error: any): error is ApiError {
    return error && typeof error.code === 'string' && typeof error.message === 'string';
}
