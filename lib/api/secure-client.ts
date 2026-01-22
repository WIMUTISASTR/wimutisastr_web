/**
 * Secure API client with built-in CSRF protection
 * Use this instead of raw fetch for authenticated requests
 */

import { getCsrfToken, clearCsrfToken } from '../security/csrf-client';

export interface ApiClientOptions extends RequestInit {
  skipCsrf?: boolean;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Secure API client with automatic CSRF token handling
 */
export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl = '') {
    this.baseUrl = baseUrl;
  }

  /**
   * Make an API request with automatic CSRF protection
   */
  async request<T = unknown>(
    endpoint: string,
    options: ApiClientOptions = {}
  ): Promise<T> {
    const { skipCsrf = false, ...fetchOptions } = options;
    const url = `${this.baseUrl}${endpoint}`;
    const method = (fetchOptions.method || 'GET').toUpperCase();

    // Add CSRF token for state-changing methods
    if (!skipCsrf && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      try {
        const csrfToken = await getCsrfToken();
        fetchOptions.headers = {
          ...fetchOptions.headers,
          'X-CSRF-Token': csrfToken,
        };
      } catch (error) {
        console.error('Failed to get CSRF token:', error);
        throw new ApiError('CSRF token fetch failed', 0, 'CSRF_FETCH_ERROR');
      }
    }

    // Ensure credentials are included
    fetchOptions.credentials = 'include';

    try {
      const response = await fetch(url, fetchOptions);

      // Handle CSRF errors
      if (response.status === 403) {
        const data = await response.json().catch(() => ({}));
        if (data.code === 'CSRF_VALIDATION_FAILED') {
          clearCsrfToken();
          throw new ApiError(
            data.error || 'CSRF validation failed',
            403,
            'CSRF_VALIDATION_FAILED',
            data
          );
        }
      }

      // Handle rate limiting
      if (response.status === 429) {
        const data = await response.json().catch(() => ({}));
        const retryAfter = response.headers.get('Retry-After');
        throw new ApiError(
          data.error || 'Rate limit exceeded',
          429,
          'RATE_LIMIT_EXCEEDED',
          { retryAfter, ...data }
        );
      }

      // Handle other errors
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new ApiError(
          data.error || `Request failed with status ${response.status}`,
          response.status,
          data.code,
          data
        );
      }

      // Parse response
      const contentType = response.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        return await response.json();
      }

      return (await response.text()) as unknown as T;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(
        'Network error',
        0,
        'NETWORK_ERROR',
        error
      );
    }
  }

  /**
   * GET request
   */
  async get<T = unknown>(endpoint: string, options?: ApiClientOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  /**
   * POST request
   */
  async post<T = unknown>(
    endpoint: string,
    data?: unknown,
    options?: ApiClientOptions
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });
  }

  /**
   * POST FormData (for file uploads)
   */
  async postFormData<T = unknown>(
    endpoint: string,
    formData: FormData,
    options?: ApiClientOptions
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: formData,
      // Don't set Content-Type - browser will set it with boundary
    });
  }

  /**
   * PUT request
   */
  async put<T = unknown>(
    endpoint: string,
    data?: unknown,
    options?: ApiClientOptions
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });
  }

  /**
   * PATCH request
   */
  async patch<T = unknown>(
    endpoint: string,
    data?: unknown,
    options?: ApiClientOptions
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });
  }

  /**
   * DELETE request
   */
  async delete<T = unknown>(endpoint: string, options?: ApiClientOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

/**
 * Default API client instance
 */
export const apiClient = new ApiClient('/api');

/**
 * Helper to add authorization header
 */
export function withAuth(token: string): { headers: { Authorization: string } } {
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
}
