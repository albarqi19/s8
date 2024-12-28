import { APIError } from './errors';
import { API_CONFIG } from './config';
import { withRetry } from './retry';

export async function fetchFromAPI<T>(url: string): Promise<T> {
  return withRetry(async () => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.REQUEST.TIMEOUT);

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: API_CONFIG.HEADERS,
        mode: 'cors',
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new APIError(
          `خطأ في الطلب: ${response.statusText}`,
          response.status
        );
      }

      const data = await response.json();
      if (!data) {
        throw new APIError('لم يتم استلام بيانات من الخادم');
      }

      return Array.isArray(data) ? data : (data.data || data);
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new APIError('انتهت مهلة الطلب');
      }
      
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw new APIError('تعذر الاتصال بالخادم');
      }

      throw error instanceof APIError ? error : new APIError('خطأ غير متوقع');
    } finally {
      clearTimeout(timeoutId);
    }
  });
}