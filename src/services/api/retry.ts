import { APIError } from './errors';
import { API_CONFIG } from './config';

export async function withRetry<T>(
  operation: () => Promise<T>,
  attempts: number = API_CONFIG.REQUEST.RETRY_ATTEMPTS
): Promise<T> {
  let lastError: Error;
  
  for (let i = 0; i < attempts; i++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      if (i < attempts - 1) {
        await new Promise(resolve => 
          setTimeout(resolve, API_CONFIG.REQUEST.RETRY_DELAY)
        );
        continue;
      }
      break;
    }
  }
  
  throw lastError;
}