import type { UseBoundStore, StoreApi } from 'zustand';
import { createLocalSessionStore, type SessionState } from './localSession';

type SessionStoreHook = UseBoundStore<StoreApi<SessionState>>;

let store: SessionStoreHook | null = null;
let initPromise: Promise<SessionStoreHook> | null = null;

export function initSessionStore(): Promise<SessionStoreHook> {
  if (initPromise) return initPromise;

  initPromise = (async () => {
    try {
      const mod = (await import('hostTemplate/stores/session')) as {
        useSessionStore: SessionStoreHook;
      };
      store = mod.useSessionStore;
    } catch (err) {
      console.warn(
        '[session] hostTemplate/stores/session unavailable; using local fallback',
        err,
      );
      store = createLocalSessionStore();
    }
    return store;
  })();

  return initPromise;
}

export function useSessionStore<T>(selector: (state: SessionState) => T): T {
  if (!store) {
    throw new Error(
      '[session] store not initialized — call initSessionStore() in bootstrap before render',
    );
  }
  return store(selector);
}

export function getSessionStore(): SessionStoreHook {
  if (!store) {
    throw new Error('[session] store not initialized');
  }
  return store;
}

export type { SessionState, Theme } from './localSession';
