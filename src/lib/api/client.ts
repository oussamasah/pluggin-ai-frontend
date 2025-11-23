// lib/api/client.ts
import { API_CONFIG } from '@/lib/constants';

class ApiClient {
  private baseUrl: string;
  private maxRetries = 3;
  private retryDelay = 1000;
  private timeout = 15000;

  constructor() {
    this.baseUrl = API_CONFIG.BASE_URL;
  }

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}, 
    retryCount = 0
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    console.log(`🔗 API Request: ${endpoint} (attempt ${retryCount + 1}/${this.maxRetries + 1})`);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);
    try {

      const config: RequestInit = {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
        signal: controller.signal,
      };

      const response = await fetch(url, config);
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const error = new Error(errorData.message || `HTTP error! status: ${response.status}`);
        
        // Don't retry for client errors (4xx) except 429 (Too Many Requests)
        if (response.status >= 400 && response.status < 500 && response.status !== 429) {
          console.error(`❌ Client error (${response.status}), not retrying:`, error);
          throw error;
        }
        
        // Retry for server errors and rate limiting
        throw error;
      }

      const data = await response.json();
      console.log(`✅ API Request successful: ${endpoint}`);
      return data;

    } catch (error) {
      clearTimeout(timeoutId);
      console.warn(`❌ API Request failed (attempt ${retryCount + 1}):`, error);

      // Check if we should retry
      const shouldRetry = this.shouldRetry(error, retryCount);
      
      if (shouldRetry) {
        const delay = this.calculateRetryDelay(retryCount);
        console.log(`⏸️ Retrying in ${delay}ms...`);
        
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.request<T>(endpoint, options, retryCount + 1);
      }

      // Final failure
      console.error(`💥 API Request failed after ${retryCount + 1} attempts:`, error);
      throw this.normalizeError(error);
    }
  }

  private shouldRetry(error: any, retryCount: number): boolean {
    // Don't retry if we've exceeded max retries
    if (retryCount >= this.maxRetries) {
      return false;
    }

    // Don't retry for these error types
    if (error.name === 'AbortError') {
      return false; // Timeout
    }

    // Retry for network errors and server errors
    if (error.message?.includes('Failed to fetch') || 
        error.message?.includes('NetworkError') ||
        error.message?.includes('ECONNREFUSED') ||
        error.message?.includes('ENOTFOUND')) {
      return true;
    }

    // Retry for specific HTTP status codes
    if (error.message) {
      const statusMatch = error.message.match(/status: (\d+)/);
      if (statusMatch) {
        const status = parseInt(statusMatch[1]);
        // Retry for server errors (5xx) and rate limiting (429)
        return status >= 500 || status === 429;
      }
    }

    return false;
  }

  private calculateRetryDelay(retryCount: number): number {
    // Exponential backoff with jitter
    const exponentialDelay = this.retryDelay * Math.pow(2, retryCount);
    const jitter = exponentialDelay * 0.1 * Math.random(); // ±10% jitter
    return Math.min(exponentialDelay + jitter, 10000); // Max 10 seconds
  }

  private normalizeError(error: any): Error {
    if (error.name === 'AbortError') {
      return new Error('Request timeout - the server took too long to respond');
    }
    
    if (error.message?.includes('Failed to fetch')) {
      return new Error('Network error - unable to reach the server. Please check your connection.');
    }
    
    return error;
  }

  // Health check with quick timeout for connection testing
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000); // Quick timeout for health check

      const response = await fetch(`${this.baseUrl}/health`, {
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Health check failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.warn('Health check failed:', error);
      throw error;
    }
  }

  // Enhanced workflow methods with better error handling
  async startWorkflow(query: string, sessionId: string, icpModelId?: string) {
    return this.request<{ success: boolean; sessionId: string; message: string }>('/api/workflow/start', {
      method: 'POST',
      body: JSON.stringify({ query, sessionId, icpModelId }),
    });
  }

  async getWorkflowStatus(sessionId: string) {
    return this.request<{ sessionId: string; status: string; lastUpdated: string }>(
      `/api/workflow/status/${sessionId}`
    );
  }

  // Session management
  async getSessions(userId: string) {
    return this.request<{ sessions: any[] }>(`/api/sessions?userId=${userId}`);
  }

  async createSession(name: string, userId: string) {
    return this.request<{ session: any }>('/api/sessions', {
      method: 'POST',
      body: JSON.stringify({ name, userId }),
    });
  }

  // Company data
  async getCompanies(filters?: any) {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== 'all') {
          params.append(key, value as string);
        }
      });
    }
    
    const queryString = params.toString();
    const endpoint = queryString ? `/api/companies?${queryString}` : '/api/companies';
    
    return this.request<{ companies: any[] }>(endpoint);
  }

  // Check if backend is reachable
  async isBackendReachable(): Promise<boolean> {
    try {
      await this.healthCheck();
      return true;
    } catch {
      return false;
    }
  }
}

export const apiClient = new ApiClient();