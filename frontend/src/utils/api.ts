/**
 * API Utility Functions
 * Centralized API client for making authenticated requests to the backend
 */

import type { ApiError } from '../types';

// Backend API base URL - configured via environment variable
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

/**
 * Custom error class for API errors
 * Provides structured error handling with status codes and messages
 */
export class ApiClientError extends Error {
    statusCode: number;
    detail: string;
    errorCode?: string;

    constructor(
        statusCode: number,
        detail: string,
        errorCode?: string
    ) {
        super(detail);
        this.name = 'ApiClientError';
        this.statusCode = statusCode;
        this.detail = detail;
        this.errorCode = errorCode;
    }
}

/**
 * Get authentication token from localStorage
 * @returns JWT token or null if not logged in
 */
export function getAuthToken(): string | null {
    return localStorage.getItem('fareshare_token');
}

/**
 * Save authentication token to localStorage
 * @param token - JWT access token
 */
export function setAuthToken(token: string): void {
    localStorage.setItem('fareshare_token', token);
}

/**
 * Remove authentication token from localStorage
 * Called during logout
 */
export function removeAuthToken(): void {
    localStorage.removeItem('fareshare_token');
}

/**
 * Make an authenticated API request
 * Automatically includes JWT token in Authorization header if available
 * 
 * @param endpoint - API endpoint path (e.g., '/api/users')
 * @param options - Fetch options (method, body, headers, etc.)
 * @returns Parsed JSON response
 * @throws ApiClientError if request fails
 */
export async function apiRequest<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    // Construct full URL
    const url = `${API_BASE_URL}${endpoint}`;

    // Get auth token if available
    const token = getAuthToken();

    // Prepare headers
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    };

    // Add custom headers from options
    if (options.headers) {
        Object.assign(headers, options.headers);
    }

    // Add Authorization header if token exists
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    try {
        // Make the request
        const response = await fetch(url, {
            ...options,
            headers,
        });

        // Parse response body
        let data: any;
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            data = await response.json();
        } else {
            data = await response.text();
        }

        // Handle error responses
        if (!response.ok) {
            const error: ApiError = data;
            throw new ApiClientError(
                response.status,
                error.detail || 'An error occurred',
                error.error_code
            );
        }

        return data as T;
    } catch (error) {
        // Re-throw ApiClientError as-is
        if (error instanceof ApiClientError) {
            throw error;
        }

        // Handle network errors
        if (error instanceof TypeError) {
            throw new ApiClientError(
                0,
                'Network error. Please check your connection and try again.'
            );
        }

        // Handle other errors
        throw new ApiClientError(
            500,
            'An unexpected error occurred. Please try again.'
        );
    }
}

/**
 * Convenience method for GET requests
 */
export async function apiGet<T>(endpoint: string): Promise<T> {
    return apiRequest<T>(endpoint, { method: 'GET' });
}

/**
 * Convenience method for POST requests
 */
export async function apiPost<T>(
    endpoint: string,
    data?: any
): Promise<T> {
    return apiRequest<T>(endpoint, {
        method: 'POST',
        body: data ? JSON.stringify(data) : undefined,
    });
}

/**
 * Convenience method for PUT requests
 */
export async function apiPut<T>(
    endpoint: string,
    data?: any
): Promise<T> {
    return apiRequest<T>(endpoint, {
        method: 'PUT',
        body: data ? JSON.stringify(data) : undefined,
    });
}

/**
 * Convenience method for PATCH requests
 */
export async function apiPatch<T>(
    endpoint: string,
    data?: any
): Promise<T> {
    return apiRequest<T>(endpoint, {
        method: 'PATCH',
        body: data ? JSON.stringify(data) : undefined,
    });
}

/**
 * Convenience method for DELETE requests
 */
export async function apiDelete<T>(endpoint: string): Promise<T> {
    return apiRequest<T>(endpoint, { method: 'DELETE' });
}
