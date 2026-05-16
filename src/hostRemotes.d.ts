declare module 'hostTemplate/stores/session' {
  import type { UseBoundStore, StoreApi } from 'zustand';

  export type Theme = 'light' | 'dark';

  export type SessionState = {
    userId: string | null;
    displayName: string | null;
    theme: Theme;
    setUser: (user: { userId: string; displayName: string }) => void;
    clearUser: () => void;
    setTheme: (theme: Theme) => void;
  };

  export const useSessionStore: UseBoundStore<StoreApi<SessionState>>;
}
