import { useState, useCallback, useEffect } from 'react';
import type { ContentItem } from '../types';
import { fetchContents } from '../services/api/sheets';
import { APIError } from '../services/api/errors';

export function useContents() {
  const [contents, setContents] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchContents();
      setContents(data);
    } catch (err) {
      const message = err instanceof APIError 
        ? err.message 
        : 'حدث خطأ أثناء تحميل المحتوى. يرجى المحاولة مرة أخرى.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { contents, loading, error, refresh };
}