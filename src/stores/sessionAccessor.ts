import { use } from 'react';
import type { UseBoundStore, StoreApi } from 'zustand';
import { createLocalSessionStore, type SessionState } from './localSession';

type SessionStoreHook = UseBoundStore<StoreApi<SessionState>>;

let resolvedStore: SessionStoreHook | null = null;

const storePromise: Promise<SessionStoreHook> = (async () => {
  try {
    const mod = (await import('hostTemplate/stores/session')) as {
      useSessionStore: SessionStoreHook;
    };
    resolvedStore = mod.useSessionStore;
  } catch (err) {
    console.warn(
      '[session] hostTemplate/stores/session unavailable; using local fallback',
      err,
    );
    resolvedStore = createLocalSessionStore();
  }
  return resolvedStore;
})();

export function useSessionStore<T>(selector: (state: SessionState) => T): T {
  const store = resolvedStore ?? use(storePromise);
  return store(selector);
}

export function getSessionStore(): SessionStoreHook {
  if (!resolvedStore) {
    throw new Error(
      '[session] store not yet resolved — await initSessionStore() first or use the hook inside a Suspense boundary',
    );
  }
  return resolvedStore;
}

export async function initSessionStore(): Promise<SessionStoreHook> {
  return storePromise;
}

export type { SessionState, Theme, CartItem } from './localSession';
