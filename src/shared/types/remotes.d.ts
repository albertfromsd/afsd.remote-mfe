declare module 'hostTemplate/stores/store' {
  import type { UseBoundStore, StoreApi } from 'zustand';

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

  export const useStore: UseBoundStore<StoreApi<AppState>>;
}
