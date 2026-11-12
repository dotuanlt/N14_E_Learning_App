import { Platform } from 'react-native';

/**
 * Lưu trữ khóa-giá trị bền vững cho mọi nền tảng:
 *  - Web: localStorage.
 *  - iOS/Android: AsyncStorage; riêng token đăng nhập nằm trong SecureStore (Keychain/Keystore).
 * Trước đây trên điện thoại dữ liệu chỉ nằm trong RAM nên mất đăng nhập và lịch sử chat mỗi lần mở lại app.
 * Luôn có bản sao trong RAM làm dự phòng nếu bộ nhớ gốc lỗi.
 */
const SECURE_KEYS = new Set(['auth_token', 'refresh_token']);
const isWeb = Platform.OS === 'web';

type AsyncStorageLike = {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
  getAllKeys(): Promise<readonly string[]>;
  multiRemove(keys: readonly string[]): Promise<void>;
};
type SecureStoreLike = {
  getItemAsync(key: string): Promise<string | null>;
  setItemAsync(key: string, value: string): Promise<void>;
  deleteItemAsync(key: string): Promise<void>;
};

let asyncStorage: AsyncStorageLike | null = null;
let secureStore: SecureStoreLike | null = null;
if (!isWeb) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    asyncStorage = require('@react-native-async-storage/async-storage').default;
  } catch {
    asyncStorage = null;
  }
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    secureStore = require('expo-secure-store');
  } catch {
    secureStore = null;
  }
}

function parse<T>(raw: string | null | undefined): T | null {
  if (raw == null || raw === '') return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return raw as unknown as T;
  }
}

class PersistentStorage {
  private memory = new Map<string, string>();

  private async read(key: string): Promise<string | null> {
    try {
      if (isWeb) {
        if (typeof window !== 'undefined' && window.localStorage) return window.localStorage.getItem(key);
      } else if (SECURE_KEYS.has(key) && secureStore) {
        return await secureStore.getItemAsync(key);
      } else if (asyncStorage) {
        return await asyncStorage.getItem(key);
      }
    } catch {
      // rơi về bản sao trong RAM
    }
    return this.memory.get(key) ?? null;
  }

  async getItem<T = string>(key: string): Promise<T | null> {
    const cached = this.memory.get(key);
    if (cached != null) return parse<T>(cached);
    const raw = await this.read(key);
    if (raw != null) this.memory.set(key, raw);
    return parse<T>(raw);
  }

  async setItem(key: string, value: unknown): Promise<void> {
    const serialized = typeof value === 'string' ? value : JSON.stringify(value);
    this.memory.set(key, serialized);
    try {
      if (isWeb) {
        if (typeof window !== 'undefined' && window.localStorage) window.localStorage.setItem(key, serialized);
      } else if (SECURE_KEYS.has(key) && secureStore) {
        await secureStore.setItemAsync(key, serialized);
      } else if (asyncStorage) {
        await asyncStorage.setItem(key, serialized);
      }
    } catch {
      // đã có bản sao trong RAM
    }
  }

  async removeItem(key: string): Promise<void> {
    this.memory.delete(key);
    try {
      if (isWeb) {
        if (typeof window !== 'undefined' && window.localStorage) window.localStorage.removeItem(key);
      } else if (SECURE_KEYS.has(key) && secureStore) {
        await secureStore.deleteItemAsync(key);
      } else if (asyncStorage) {
        await asyncStorage.removeItem(key);
      }
    } catch {
      // bỏ qua
    }
  }

  /** Xóa mọi khóa bắt đầu bằng prefix (dùng để dọn cache / dữ liệu của người dùng cũ). */
  async removeByPrefix(prefix: string): Promise<void> {
    for (const k of [...this.memory.keys()]) {
      if (k.startsWith(prefix)) this.memory.delete(k);
    }
    try {
      if (isWeb) {
        if (typeof window !== 'undefined' && window.localStorage) {
          const ls = window.localStorage;
          for (let i = ls.length - 1; i >= 0; i--) {
            const k = ls.key(i);
            if (k && k.startsWith(prefix)) ls.removeItem(k);
          }
        }
      } else if (asyncStorage) {
        const keys = (await asyncStorage.getAllKeys()).filter((k) => k.startsWith(prefix));
        if (keys.length) await asyncStorage.multiRemove(keys);
      }
    } catch {
      // bỏ qua
    }
  }

  async clear(): Promise<void> {
    const keys = [...this.memory.keys()];
    this.memory.clear();
    await Promise.all(keys.map((k) => this.removeItem(k)));
    try {
      if (isWeb) {
        if (typeof window !== 'undefined' && window.localStorage) window.localStorage.clear();
      } else if (asyncStorage) {
        const all = await asyncStorage.getAllKeys();
        if (all.length) await asyncStorage.multiRemove(all);
      }
    } catch {
      // bỏ qua
    }
  }
}

export const storage = new PersistentStorage();
