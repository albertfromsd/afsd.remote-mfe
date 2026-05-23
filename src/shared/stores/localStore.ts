import { create } from 'zustand';
import { devtools, persist, createJSONStorage } from 'zustand/middleware';
import { APP, STORAGE } from '@/shared/config/app.constants';

// Standalone fallback for the federated host store. Must mirror the AppState
// shape declared in host/src/shared/stores/store.ts. When the host shape
// changes, three places update in lock-step:
//   1. host/src/shared/stores/store.ts (canonical)
//   2. this file
//   3. ../types/remotes.d.ts

export type Theme = 'light' | 'dark';

export type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
};

export type AppState = {
  userId: string | null;
  displayName: string | null;
  theme: Theme;
  cart: CartItem[];
  setUser: (user: { userId: string; displayName: string }) => void;
  clearUser: () => void;
  setTheme: (theme: Theme) => void;
  addToCart: (item: Omit<CartItem, 'quantity'>) => void;
  incrementCart: (id: string) => void;
  decrementCart: (id: string) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
};

export function createLocalStore() {
  const creator = persist<AppState>(
    (set) => ({
      userId: null,
      displayName: null,
      theme: 'dark',
      cart: [],
      setUser: (user) => set({ userId: user.userId, displayName: user.displayName }),
      clearUser: () => set({ userId: null, displayName: null }),
      setTheme: (theme) => set({ theme }),
      addToCart: (item) =>
        set((state) => {
          const existing = state.cart.find((c) => c.id === item.id);
          if (existing) {
            return {
              cart: state.cart.map((c) =>
                c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c,
              ),
            };
          }
          return { cart: [...state.cart, { ...item, quantity: 1 }] };
        }),
      incrementCart: (id) =>
        set((state) => ({
          cart: state.cart.map((c) => (c.id === id ? { ...c, quantity: c.quantity + 1 } : c)),
        })),
      decrementCart: (id) =>
        set((state) => ({
          cart: state.cart
            .map((c) => (c.id === id ? { ...c, quantity: c.quantity - 1 } : c))
            .filter((c) => c.quantity > 0),
        })),
      removeFromCart: (id) => set((state) => ({ cart: state.cart.filter((c) => c.id !== id) })),
      clearCart: () => set({ cart: [] }),
    }),
    {
      name: STORAGE.STORE_KEY,
      version: STORAGE.STORE_VERSION,
      storage: createJSONStorage(() => sessionStorage),
    },
  );

  return process.env.NODE_ENV === 'production'
    ? create<AppState>()(creator)
    : create<AppState>()(devtools(creator, { name: `${APP.NAME}-local` }));
}
