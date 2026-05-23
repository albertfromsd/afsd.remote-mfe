import { use } from 'react';
import type { UseBoundStore, StoreApi } from 'zustand';
import { createLocalStore, type AppState } from './localStore';

type StoreHook = UseBoundStore<StoreApi<AppState>>;

let resolvedStore: StoreHook | null = null;

const storePromise: Promise<StoreHook> = (async () => {
  try {
    const mod = (await import('hostTemplate/stores/store')) as {
      useStore: StoreHook;
    };
    resolvedStore = mod.useStore;
  } catch (err) {
    console.warn('[store] hostTemplate/stores/store unavailable; using local fallback', err);
    resolvedStore = createLocalStore();
  }
  return resolvedStore;
})();

export function useStore<T>(selector: (state: AppState) => T): T {
  const store = resolvedStore ?? use(storePromise);
  return store(selector);
}

export function getStore(): StoreHook {
  if (!resolvedStore) {
    throw new Error(
      '[store] store not yet resolved — await initStore() first or use the hook inside a Suspense boundary',
    );
  }
  return resolvedStore;
}

export async function initStore(): Promise<StoreHook> {
  return storePromise;
}

export type { AppState, Theme, CartItem } from './localStore';
