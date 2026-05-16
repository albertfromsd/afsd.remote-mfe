import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type Theme = 'light' | 'dark';

export type SessionState = {
  userId: string | null;
  displayName: string | null;
  theme: Theme;
  setUser: (user: { userId: string; displayName: string }) => void;
  clearUser: () => void;
  setTheme: (theme: Theme) => void;
};

const STORAGE_KEY = 'afsd.session.v1';

export function createLocalSessionStore() {
  return create<SessionState>()(
    persist(
      set => ({
        userId: null,
        displayName: null,
        theme: 'dark',
        setUser: user => set({ userId: user.userId, displayName: user.displayName }),
        clearUser: () => set({ userId: null, displayName: null }),
        setTheme: theme => set({ theme }),
      }),
      {
        name: STORAGE_KEY,
        version: 1,
        storage: createJSONStorage(() => sessionStorage),
      },
    ),
  );
}
