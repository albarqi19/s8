import { API_CONFIG } from './config';

export async function fetchFromAPI<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${endpoint}`);
  
  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }

  const data = await response.json();
  if (data.error) {
    throw new Error(data.message || 'Unknown API error');
  }

  return data;
}