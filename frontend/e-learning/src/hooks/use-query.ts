import { useCallback, useEffect, useRef, useState } from 'react';

import { queryCache } from '@/api/cache';

interface Options {
  /** Dữ liệu còn "tươi" trong bao lâu (ms) thì không cần tải lại. Mặc định 60 giây. */
  staleMs?: number;
  enabled?: boolean;
}

/** useQuery kiểu SWR: trả dữ liệu cache ngay, tải lại ở nền khi cũ. */
export function useQuery<T>(key: string, fetcher: () => Promise<T>, opts: Options = {}) {
  const { staleMs = 60_000, enabled = true } = opts;
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const [data, setData] = useState<T | undefined>(() => queryCache.peek<T>(key)?.data);
  const [loading, setLoading] = useState(data === undefined);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<unknown>(null);

  const load = useCallback(
    async (force = false) => {
      const cached = queryCache.peek<T>(key) ?? (await queryCache.read<T>(key));
      if (cached) {
        setData(cached.data);
        setLoading(false);
        if (!force && Date.now() - cached.at < staleMs) return;
      }
      try {
        setError(null);
        const fresh = await queryCache.fetch(key, () => fetcherRef.current());
        setData(fresh);
      } catch (e) {
        setError(e);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [key, staleMs],
  );

  useEffect(() => {
    if (!enabled) return;
    load();
    return queryCache.subscribe(key, () => {
      const c = queryCache.peek<T>(key);
      if (c) setData(c.data);
    });
  }, [key, enabled, load]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await load(true);
  }, [load]);

  return { data, loading, refreshing, error, refresh };
}
