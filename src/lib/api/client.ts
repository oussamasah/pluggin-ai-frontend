// lib/api/client.ts
import { API_CONFIG } from '@/lib/constants';

class ApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_CONFIG.BASE_URL;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

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

  async healthCheck() {
    return this.request<{ status: string; timestamp: string }>('/health');
  }
  
}

export const apiClient = new ApiClient();