import { useSyncExternalStore } from 'react';
import { navigationRef } from './navigationRef';

let current: string | undefined;
const listeners = new Set<() => void>();

/** Gọi từ NavigationContainer (onReady / onStateChange) để mọi nơi biết đang ở màn hình nào. */
export function syncCurrentRoute() {
  const next = navigationRef.isReady() ? navigationRef.getCurrentRoute()?.name : undefined;
  if (next === current) return;
  current = next;
  listeners.forEach((l) => l());
}

export function useCurrentRouteName(): string | undefined {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => current,
    () => undefined,
  );
}
