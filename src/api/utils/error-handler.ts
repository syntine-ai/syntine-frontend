/**
 * API Error Handler
 * Centralized error handling for API calls
 */

import { ApiException } from '../types/common';
import { PostgrestError } from '@supabase/supabase-js';

/**
 * Handle Supabase errors and convert to ApiException
 */
export function handleSupabaseError(error: PostgrestError | Error): ApiException {
    if (isPostgrestError(error)) {
        // Supabase PostgrestError
        return new ApiException(
            error.code || 'SUPABASE_ERROR',
            error.message,
            { hint: error.hint, details: error.details },
            parseInt(error.code) || 500
        );
    }

    // Generic Error
    return new ApiException(
        'UNKNOWN_ERROR',
        error.message || 'An unexpected error occurred',
        undefined,
        500
    );
}

/**
 * Handle Axios/Fetch errors
 */
export function handleHttpError(error: any): ApiException {
    if (error.response) {
        // Server responded with error
        const data = error.response.data;
        return new ApiException(
            data?.code || 'HTTP_ERROR',
            data?.message || error.message,
            data?.details,
            error.response.status
        );
    } else if (error.request) {
        // Request made but no response
        return new ApiException(
            'NETWORK_ERROR',
            'No response from server. Please check your connection.',
            undefined,
            0
        );
    } else {
        // Something else happened
        return new ApiException(
            'REQUEST_ERROR',
            error.message || 'Failed to make request',
            undefined,
            0
        );
    }
}

/**
 * Log error to console (in development)
 */
export function logError(error: ApiException, context?: string): void {
    if (import.meta.env.DEV) {
        console.error(
            `[API Error${context ? ` - ${context}` : ''}]:`,
            {
                code: error.code,
                message: error.message,
                details: error.details,
                statusCode: error.statusCode,
            }
        );
    }
}

/**
 * Get user-friendly error message
 */
export function getUserFriendlyMessage(error: ApiException): string {
    // Map common error codes to user-friendly messages
    const messageMap: Record<string, string> = {
        'PGRST116': 'No data found',
        'PGRST301': 'You do not have permission to perform this action',
        '23505': 'This record already exists',
        '23503': 'Cannot delete this record because it is referenced by other data',
        'NETWORK_ERROR': 'Unable to connect to the server. Please check your internet connection.',
        'UNAUTHORIZED': 'You must be logged in to perform this action',
        'FORBIDDEN': 'You do not have permission to access this resource',
    };

    return messageMap[error.code] || error.message;
}

/**
 * Type guard for PostgrestError
 */
function isPostgrestError(error: any): error is PostgrestError {
    return error && typeof error.code === 'string' && typeof error.message === 'string';
}

/**
 * Wrap async function with error handling
 */
export async function withErrorHandling<T>(
    fn: () => Promise<T>,
    context?: string
): Promise<T> {
    try {
        return await fn();
    } catch (error: any) {
        const apiError = isPostgrestError(error)
            ? handleSupabaseError(error)
            : handleHttpError(error);

        logError(apiError, context);
        throw apiError;
    }
}
