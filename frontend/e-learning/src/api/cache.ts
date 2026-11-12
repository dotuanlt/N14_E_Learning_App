import { storage } from '@/storage';

/**
 * Cache "stale-while-revalidate" cho dữ liệu đọc (danh sách khóa học, danh mục...):
 *  - hiện ngay dữ liệu đã có (RAM → ổ đĩa) rồi mới tải mới ở nền;
 *  - gộp các lệnh gọi trùng nhau đang chạy (dedupe);
 *  - bền vững qua lần mở app sau, giúp màn hình chính hiện gần như tức thì.
 */
const PREFIX = 'qc_';
const MAX_AGE_PERSIST_MS = 24 * 60 * 60 * 1000;

interface Entry<T> {
  data: T;
  at: number;
}

const memory = new Map<string, Entry<unknown>>();
const inflight = new Map<string, Promise<unknown>>();
const listeners = new Map<string, Set<() => void>>();

function emit(key: string) {
  listeners.get(key)?.forEach((fn) => fn());
}

export const queryCache = {
  peek<T>(key: string): Entry<T> | undefined {
    return memory.get(key) as Entry<T> | undefined;
  },

  /** Đọc từ RAM, nếu chưa có thì từ ổ đĩa. */
  async read<T>(key: string): Promise<Entry<T> | undefined> {
    const hit = memory.get(key) as Entry<T> | undefined;
    if (hit) return hit;
    const saved = await storage.getItem<Entry<T>>(PREFIX + key);
    if (saved && typeof saved.at === 'number' && Date.now() - saved.at < MAX_AGE_PERSIST_MS) {
      memory.set(key, saved);
      return saved;
    }
    return undefined;
  },

  set<T>(key: string, data: T) {
    const entry = { data, at: Date.now() };
    memory.set(key, entry);
    storage.setItem(PREFIX + key, entry);
    emit(key);
  },

  /** Gọi fetcher, gộp các lệnh gọi đồng thời cùng key. */
  fetch<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
    const running = inflight.get(key) as Promise<T> | undefined;
    if (running) return running;
    const p = fetcher()
      .then((data) => {
        queryCache.set(key, data);
        return data;
      })
      .finally(() => inflight.delete(key));
    inflight.set(key, p);
    return p;
  },

  invalidate(prefix: string) {
    for (const k of [...memory.keys()]) if (k.startsWith(prefix)) memory.delete(k);
    storage.removeByPrefix(PREFIX + prefix);
  },

  /** Xóa toàn bộ (khi đăng xuất, tránh lộ dữ liệu cá nhân hóa của người trước). */
  clear() {
    memory.clear();
    storage.removeByPrefix(PREFIX);
  },

  subscribe(key: string, fn: () => void): () => void {
    let set = listeners.get(key);
    if (!set) listeners.set(key, (set = new Set()));
    set.add(fn);
    return () => set!.delete(fn);
  },
};
