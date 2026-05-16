import { describe, it, expect, beforeEach } from 'vitest';
import { createLocalSessionStore } from './localSession';

describe('createLocalSessionStore (standalone fallback)', () => {
  let store: ReturnType<typeof createLocalSessionStore>;

  beforeEach(() => {
    sessionStorage.clear();
    store = createLocalSessionStore();
  });

  it('starts with empty cart and null user', () => {
    const state = store.getState();
    expect(state.cart).toEqual([]);
    expect(state.userId).toBeNull();
    expect(state.displayName).toBeNull();
  });

  it('addToCart followed by increment/decrement maintains correct quantity', () => {
    const { addToCart, incrementCart, decrementCart } = store.getState();
    addToCart({ id: 'x', name: 'X', price: 1 });
    incrementCart('x');
    incrementCart('x');
    decrementCart('x');
    expect(store.getState().cart[0].quantity).toBe(2);
  });

  it('decrement past zero removes the line item', () => {
    const { addToCart, decrementCart } = store.getState();
    addToCart({ id: 'x', name: 'X', price: 1 });
    decrementCart('x');
    expect(store.getState().cart).toHaveLength(0);
  });
});
