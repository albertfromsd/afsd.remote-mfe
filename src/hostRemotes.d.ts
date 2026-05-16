declare module 'hostTemplate/stores/session' {
  import type { UseBoundStore, StoreApi } from 'zustand';

  export type Theme = 'light' | 'dark';

  export type CartItem = {
    id: string;
    name: string;
    price: number;
    quantity: number;
  };

  export type SessionState = {
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

  export const useSessionStore: UseBoundStore<StoreApi<SessionState>>;
}
