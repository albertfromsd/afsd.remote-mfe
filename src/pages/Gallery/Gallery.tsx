import { Link } from 'react-router-dom';
import Page from '@/components/Page';
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
    <Page
      eyebrow="Remote MFE"
      title="Gallery"
      description="Adds write to the federated session store — the host's navbar cart count updates instantly."
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(11.25rem, 1fr))',
          gap: '1rem',
        }}
      >
        {ITEMS.map((item) => {
          const inCart = qtyOf(item.id);
          return (
            <div
              key={item.id}
              style={{
                padding: '1rem',
                textAlign: 'center',
                backgroundColor: 'var(--color-bg-surface)',
                border: '1px solid var(--color-border-subtle)',
                borderRadius: 'var(--radius-lg)',
              }}
            >
              <div style={{ fontSize: '3rem', lineHeight: 1 }}>{item.emoji}</div>
              <div
                style={{
                  fontSize: 'var(--font-size-md)',
                  fontWeight: 'var(--font-weight-semibold)',
                  margin: '0.5rem 0 0.25rem',
                  color: 'var(--color-text-primary)',
                }}
              >
                {item.name}
              </div>
              <div
                style={{
                  marginBottom: '0.75rem',
                  color: 'var(--color-text-secondary)',
                  fontSize: 'var(--font-size-sm)',
                }}
              >
                ${item.price.toFixed(2)}
              </div>
              <button
                type="button"
                onClick={() => addToCart({ id: item.id, name: item.name, price: item.price })}
                style={{
                  background: 'var(--color-accent)',
                  color: 'var(--color-text-on-accent)',
                  border: 0,
                  padding: '0.5rem 1rem',
                  fontWeight: 'var(--font-weight-semibold)',
                  fontSize: 'var(--font-size-sm)',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                }}
              >
                Add to cart
              </button>
              {inCart > 0 && (
                <div
                  style={{
                    marginTop: '0.5rem',
                    fontSize: 'var(--font-size-xs)',
                    color: 'var(--color-text-muted)',
                  }}
                >
                  in cart: {inCart}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <p style={{ marginTop: '2rem' }}>
        <Link to="..">← back</Link>
      </p>
    </Page>
  );
}
