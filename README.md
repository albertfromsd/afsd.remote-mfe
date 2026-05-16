# afsd.remote-mfe

Federated child app for the AFSD micro-frontend architecture. Exposes its
routed `App` to the host shell at
[albertfromsd/afsd.host-mfe](https://github.com/albertfromsd/afsd.host-mfe),
and consumes the host's federated session store.

Runs **embedded** under the host's `/remote/*` route OR **standalone** at
`http://localhost:3001` for dev and e2e — same code, same internal routes,
no router nesting.

## Stack

Mirrors the host: rsbuild, React 19, react-router-dom v7, zustand,
Module Federation (`@module-federation/enhanced`), SCSS Modules + Tailwind v4,
Vitest, ESLint, Prettier, Storybook, husky + lint-staged.

## Quick start

```bash
pnpm install
cp .env.example .env
pnpm dev                # → http://localhost:3001
```

The remote works **standalone** (host not running) — the session accessor
falls back to a local zustand store with the same shape and logs a warning
to the console. Embedded mode (host at `:3000`) provides the canonical
store via federation.

## Scripts

| Command           | What it does                                |
| ----------------- | ------------------------------------------- |
| `pnpm dev`        | Dev server with HMR on port 3001            |
| `pnpm build`      | Production build to `dist/`                 |
| `pnpm preview`    | Serve the production build locally          |
| `pnpm analyze`    | Build with bundle analyzer (`ANALYZE=true`) |
| `pnpm typecheck`  | `tsc --noEmit`                              |
| `pnpm test`       | Vitest run (CI mode)                        |
| `pnpm test:watch` | Vitest watch mode                           |
| `pnpm lint`       | ESLint                                      |
| `pnpm format`     | Prettier `--write`                          |
| `pnpm storybook`  | Storybook dev on 6006                       |

## Architecture

### Module Federation surface

```
exposes:
  ./App  →  src/App.tsx   (a routed surface; no BrowserRouter)

remotes:
  hostTemplate  →  http://localhost:3000/hostRemoteEntry.js
    └─ used for the session store
```

### Embedded vs standalone — the BrowserRouter rule

- **Standalone** (`pnpm dev` at 3001): [src/bootstrap.tsx](src/bootstrap.tsx)
  wraps `<App />` in `<BrowserRouter>`. Internal routes resolve from `/`.
- **Embedded** (host mounts via federation): the host already has a
  `BrowserRouter` and a `<Route path="/remote/*">` parent. The exposed
  `App.tsx` only renders `<Routes>` — never `<BrowserRouter>` — so it
  inherits the host's router. React Router 6/7 picks up the parent splat,
  so internal routes that look like `path="details"` resolve to
  `/remote/details` automatically.

> If you ever nest a second `BrowserRouter` here, navigation will break.

### Internal routes

| Path (embedded as `/remote/...`) | Standalone path | Component                           |
| -------------------------------- | --------------- | ----------------------------------- |
| `/remote/`                       | `/`             | `pages/Home.tsx`                    |
| `/remote/details`                | `/details`      | `pages/Details.tsx`                 |
| `/remote/settings`               | `/settings`     | `pages/Settings.tsx`                |
| `/remote/gallery`                | `/gallery`      | `pages/Gallery.tsx` (cart-add demo) |

### Session store access (the accessor pattern)

This remote does **not** create its own session store in normal operation —
it consumes the host's via federation. Direct imports of the federated path
fail in standalone mode (host isn't reachable). The accessor handles both:

```ts
// src/stores/sessionAccessor.ts (simplified)
const storePromise = (async () => {
  try {
    const mod = await import('hostTemplate/stores/session');
    return mod.useSessionStore;
  } catch {
    console.warn('[session] host unavailable; using local fallback');
    return createLocalSessionStore();
  }
})();

export function useSessionStore<T>(selector) {
  const store = resolvedStore ?? use(storePromise); // React 19 `use`
  return store(selector);
}
```

In components:

```ts
import { useSessionStore } from '@/stores/sessionAccessor';
const cart = useSessionStore((s) => s.cart);
const addToCart = useSessionStore((s) => s.addToCart);
```

The first read suspends until the federated store resolves; subsequent reads
are synchronous against the resolved store. **Any component that calls
`useSessionStore` must be inside a Suspense boundary** — when embedded, the
host's `<RemoteApp>` already provides one; standalone, the bootstrap's
`initSessionStore()` `await` warms the cache before render.

### The local-fallback store

[src/stores/localSession.ts](src/stores/localSession.ts) creates a zustand
store with the _same shape_ as the host's. It's used:

1. In standalone mode (host unreachable).
2. In unit tests, where federation isn't wired.

The shape **must** match the host's `SessionState`. The hand-written
[src/hostRemotes.d.ts](src/hostRemotes.d.ts) declares the federated
module shape and is the current source of truth for the consuming side.

### Type sharing across the federation boundary

The `dts` option on `@module-federation/enhanced` is configured in
[rsbuild.config.ts](rsbuild.config.ts) to auto-generate `.d.ts` declarations
into `@mf-types/` (gitignored, referenced from `tsconfig.json` via
`"*": ["./@mf-types/*"]`).

**Current status**: the wiring is in place but the rsbuild wrapper isn't
emitting `@mf-types/` reliably (the wrapper's type import lags behind
`@module-federation/enhanced`'s runtime support — hence the
`@ts-expect-error` in the config). Until that gets sorted, three places
must stay aligned by hand when the session shape changes:

1. Host's `src/stores/session.ts` (canonical)
2. This repo's `src/stores/localSession.ts` (standalone fallback shape)
3. This repo's `src/hostRemotes.d.ts` (federated module type)

## Adding a new internal route

1. Component in `src/pages/NewPage.tsx`.
2. Route in [src/App.tsx](src/App.tsx):
   ```tsx
   <Route path="new-page" element={<NewPage />} />
   ```
3. Link from `Home.tsx` so it's reachable in dev.

Embedded URL becomes `/remote/new-page` automatically; standalone is
`/new-page`.

## Environment variables

| Var                        | Default                 | Purpose                                                             |
| -------------------------- | ----------------------- | ------------------------------------------------------------------- |
| `PUBLIC_HOST_TEMPLATE_URL` | `http://localhost:3000` | Origin where the host serves `hostRemoteEntry.js`                   |
| `PUBLIC_API_BASE_URL`      | _(unset)_               | Base URL for axios `api` client in [src/lib/api.ts](src/lib/api.ts) |
| `ANALYZE`                  | `false`                 | Set to `true` (via `pnpm analyze`) to emit a bundle report          |

## CI

[.github/workflows/ci.yml](.github/workflows/ci.yml): lint → typecheck →
test → build on PRs and pushes to `master`/`main`. pnpm cache + Node from
`.nvmrc`.

## Known gotchas

- **Hot-refresh after MF config changes.** Restart `pnpm dev` and hard-reload
  the browser. The federation runtime caches container metadata that doesn't
  survive config edits.
- **`initSessionStore()` is idempotent.** It memoizes the federation import
  via a module-level promise — calling it multiple times returns the same
  resolved store hook.
- **Never wrap the exposed `App` in `BrowserRouter`.** Standalone gets
  `BrowserRouter` from `bootstrap.tsx`; embedded inherits from the host.
  Double-wrapping breaks navigation silently.

## Repo layout

```
src/
├── App.tsx                       # exposed surface: <Routes> only, no Router
├── App.css                       # remote-page styles
├── main.tsx → bootstrap.tsx      # MF async-import entry (+ BrowserRouter standalone)
├── pages/                        # internal route components
│   ├── Home.tsx
│   ├── Details.tsx
│   ├── Settings.tsx
│   └── Gallery.tsx               # cart-add demo (writes federated store)
├── lib/
│   ├── api.ts                    # axios client + interceptors
│   └── mfRuntimePlugin.ts        # federation runtime error hook
├── stores/
│   ├── sessionAccessor.ts        # federated-or-local accessor (use this in components)
│   └── localSession.ts           # standalone fallback (same shape as host)
├── hostRemotes.d.ts              # hand-written federated module type (current source of truth)
└── test/setup.ts                 # vitest setup
```
