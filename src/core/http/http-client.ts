/**
 * Centralized HTTP Client
 * Handles all API requests with JWT authentication
 */

import { API_BASE } from '../api/api-config';

export interface HttpResponse<T> {
  data: T;
  status: number;
}

export interface HttpError {
  error: string;
  message: string;
  timestamp: string;
}

export class HttpClient {
  private token: string | null = null;

  /**
   * Set the JWT token (called after login/register)
   */
  setToken(token: string): void {
    this.token = token;
  }

  /**
   * Clear the JWT token (called after logout)
   */
  clearToken(): void {
    this.token = null;
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string): Promise<T> {
    const url = `${API_BASE}${endpoint}`;
    const headers = this.getHeaders();

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers,
      });

      return this.handleResponse<T>(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * POST request
   */
  async post<T>(
    endpoint: string,
    body: any,
    options?: { skipAuth?: boolean }
  ): Promise<T> {
    const url = `${API_BASE}${endpoint}`;
    const headers = this.getHeaders(!(options?.skipAuth ?? false));

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });

      return this.handleResponse<T>(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * PATCH request
   */
  async patch<T>(endpoint: string, body?: any): Promise<T> {
    const url = `${API_BASE}${endpoint}`;
    const headers = this.getHeaders();

    try {
      const response = await fetch(url, {
        method: 'PATCH',
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });

      return this.handleResponse<T>(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string): Promise<T> {
    const url = `${API_BASE}${endpoint}`;
    const headers = this.getHeaders();

    try {
      const response = await fetch(url, {
        method: 'DELETE',
        headers,
      });

      return this.handleResponse<T>(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * POST request with custom headers (for idempotency keys, etc.)
   */
  async postWithHeaders<T>(
    endpoint: string,
    body: any,
    customHeaders: Record<string, string>
  ): Promise<T> {
    const url = `${API_BASE}${endpoint}`;
    const headers = { ...this.getHeaders(), ...customHeaders };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });

      return this.handleResponse<T>(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * POST multipart/form-data (for file uploads)
   */
  async postFormData<T>(endpoint: string, formData: FormData): Promise<T> {
    const url = `${API_BASE}${endpoint}`;
    const token = this.token;

    try {
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData,
      });

      return this.handleResponse<T>(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get headers with optional JWT token
   */
  private getHeaders(includeAuth: boolean = true): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (includeAuth && this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  /**
   * Handle HTTP response
   */
  private async handleResponse<T>(response: Response): Promise<T> {
    const text = await response.text();

    // Handle empty responses (like 204 No Content)
    if (!text) {
      if (!response.ok) {
        throw {
          status: response.status,
          error: 'HTTP_ERROR',
          message: `HTTP ${response.status}`,
        };
      }
      return {} as T;
    }

    try {
      const data = JSON.parse(text);

      if (!response.ok) {
        // API error response
        throw {
          status: response.status,
          error: data.error || 'UNKNOWN_ERROR',
          message: data.message || text,
          fields: data.fields, // For validation errors
        };
      }

      return data as T;
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw {
          status: response.status,
          error: 'PARSE_ERROR',
          message: 'Failed to parse response',
        };
      }
      throw error;
    }
  }

  /**
   * Handle errors
   */
  private handleError(error: any): Error {
    console.error('❌ HTTP Error:', error);

    if (error.message === 'Network request failed') {
      return new Error('No internet connection');
    }

    if (error.status && error.error) {
      return new Error(`${error.error}: ${error.message}`);
    }

    return error;
  }
}

// Global singleton instance
export const httpClient = new HttpClient();
