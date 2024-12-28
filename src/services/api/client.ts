import { API_CONFIG } from './config';
import { APIError } from './errors';

export async function apiClient<T>(endpoint: string): Promise<T> {
  try {
    const response = await fetch(`${API_CONFIG.baseURL}${endpoint}`, {
      headers: API_CONFIG.headers,
      credentials: API_CONFIG.withCredentials ? 'include' : 'omit'
    });
    
    if (!response.ok) {
      console.error('API Error:', {
        status: response.status,
        statusText: response.statusText,
        url: response.url
      });
      
      throw new APIError(
        `Request failed: ${response.statusText}`,
        response.status
      );
    }

    const data = await response.json();
    if (data.error) {
      console.error('API Data Error:', data);
      throw new APIError(data.error, response.status, data.details);
    }

    return data;
  } catch (error) {
    console.error('API Client Error:', error);
    if (error instanceof APIError) {
      throw error;
    }
    throw new APIError(
      error instanceof Error ? error.message : 'Network error'
    );
  }
}