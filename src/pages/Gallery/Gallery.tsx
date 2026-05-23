import { Link } from 'react-router-dom';
import { useStore } from '@/shared/stores/storeAccessor';

const ITEMS = [
  { id: 'apple', name: 'Apple', price: 1.0, emoji: '🍎' },
  { id: 'banana', name: 'Banana', price: 0.5, emoji: '🍌' },
  { id: 'cherries', name: 'Cherries', price: 3.0, emoji: '🍒' },
  { id: 'donut', name: 'Donut', price: 2.0, emoji: '🍩' },
  { id: 'eggplant', name: 'Eggplant', price: 1.75, emoji: '🍆' },
  { id: 'fries', name: 'Fries', price: 2.5, emoji: '🍟' },
  { id: 'grapes', name: 'Grapes', price: 4.0, emoji: '🍇' },
  { id: 'hotdog', name: 'Hot Dog', price: 3.5, emoji: '🌭' },
];

export default function Gallery() {
  const addToCart = useStore((s) => s.addToCart);
  const cart = useStore((s) => s.cart);

  const qtyOf = (id: string) => cart.find((c) => c.id === id)?.quantity ?? 0;

  return (
    <section
      style={{
        padding: '2rem',
        background: 'repeating-linear-gradient(45deg, #220, #220 10px, #311 10px, #311 20px)',
        minHeight: 'calc(100vh - 56px)',
      }}
    >
      <h1
        style={{
          fontFamily: 'Comic Sans MS, cursive',
          color: '#ff0',
          textShadow: '3px 3px 0 #f0f, -2px -2px 0 #0ff',
          fontSize: '3rem',
          margin: '0 0 0.5rem',
        }}
      >
        ✨ THE GALLERY ✨
      </h1>
      <p style={{ color: '#fff', fontFamily: 'Comic Sans MS, cursive', marginBottom: '2rem' }}>
        Owned by the remote MFE. Adds write to the federated session store — count updates in the
        host's navbar instantly.
      </p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
          gap: '1rem',
        }}
      >
        {ITEMS.map((item) => {
          const inCart = qtyOf(item.id);
          return (
            <div
              key={item.id}
              style={{
                background: '#ff1493',
                border: '4px dashed #0ff',
                padding: '1rem',
                textAlign: 'center',
                color: '#fff',
                fontFamily: 'Comic Sans MS, cursive',
                boxShadow: '6px 6px 0 #000',
              }}
            >
              <div style={{ fontSize: '4rem', lineHeight: 1 }}>{item.emoji}</div>
              <div style={{ fontSize: '1.25rem', margin: '0.5rem 0 0.25rem' }}>{item.name}</div>
              <div style={{ marginBottom: '0.75rem' }}>${item.price.toFixed(2)}</div>
              <button
                type="button"
                onClick={() => addToCart({ id: item.id, name: item.name, price: item.price })}
                style={{
                  background: '#ff0',
                  color: '#000',
                  border: '3px solid #000',
                  padding: '0.5rem 1rem',
                  fontFamily: 'Comic Sans MS, cursive',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  boxShadow: '3px 3px 0 #f0f',
                }}
              >
                ADD TO CART
              </button>
              {inCart > 0 && (
                <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: '#0ff' }}>
                  in cart: {inCart}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <p style={{ marginTop: '2rem' }}>
        <Link to=".." style={{ color: '#0ff' }}>
          ← back
        </Link>
      </p>
    </section>
  );
}
