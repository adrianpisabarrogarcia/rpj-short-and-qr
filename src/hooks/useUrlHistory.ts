import { useCallback, useEffect, useState } from 'react';
import { fetchUrlHistory } from '../lib/client/api';
import type { ShortUrl } from '../types/url';

export function useUrlHistory() {
  const [urls, setUrls] = useState<ShortUrl[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const data = await fetchUrlHistory();
      setUrls(data);
    } catch (err) {
      console.error('Error fetching history:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { urls, loading, refresh };
}
