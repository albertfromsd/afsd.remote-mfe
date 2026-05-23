# AGENTS.md

You are an expert in Typescript, Rsbuild, and web application development.
You write maintainable, performant, and accessible code. This file collects
rules specific to this codebase. Where it disagrees with general convention,
follow this file.

## Commands

- `pnpm dev` — start the dev server (port 3001)
- `pnpm build` — production build to `dist/`
- `pnpm typecheck` — `tsc --noEmit`
- `pnpm test` — vitest run
- `pnpm lint` / `pnpm format` — ESLint / Prettier

## External docs

- Rsbuild: https://rsbuild.rs/llms.txt
- Rspack: https://rspack.rs/llms.txt
- TanStack Query: https://tanstack.com/query/latest/docs/react/overview
- Zustand: https://zustand.docs.pmnd.rs

## Folder structure

Mirrors the host's 1:1.

```
src/
├── App.tsx, App.scss, bootstrap.tsx, main.tsx, env.d.ts
├── components/    # leaf UI primitives
├── pages/         # internal route components
└── shared/        # anything imported by 2+ siblings above
    ├── config/    # *.constants.ts files
    ├── lib/       # external-world adapters: api, queryClient, mfRuntimePlugin
    ├── stores/    # storeAccessor + localStore (NO direct store.ts — host owns canonical)
    ├── styles/    # tokens, themes, mixins
    ├── test/      # vitest setup, renderWithProviders
    ├── types/     # cross-cutting types, remotes.d.ts
    └── utils/     # pure helpers (no I/O, no side effects)
```

Notable differences from host: no `features/`, no `router/` (the remote
exposes `<Routes>` only; the host owns the router). When a remote-only
feature grows into a "composed cross-cutting UI" pattern, add `features/`
here and update this rule.

**The `shared/` rule:** code goes in `shared/` **iff** more than one sibling
imports it. Single-use code colocates with the page that uses it.

**`lib/` vs `utils/`** — keep distinct, don't merge:

- `shared/lib/` = code that touches the outside world (HTTP, browser APIs,
  federation runtime).
- `shared/utils/` = pure functions, no I/O, no side effects.

**Where things must stay:**

- `App.tsx`, `bootstrap.tsx`, `main.tsx`, `env.d.ts` at `src/` root.
- `App.tsx` is the **federation-exposed surface** — must render `<Routes>`
  only, NEVER wrap itself in `<BrowserRouter>` or `<QueryClientProvider>`.
  Standalone providers live in `bootstrap.tsx`.
- `*.module.scss` colocates with its component.

## Path aliases

[`config.alias.ts`](config.alias.ts) at the project root is the **single
source of truth** for `@/...` imports. [`tsconfig.json`](tsconfig.json)'s
`paths` block MUST mirror it. When you add a new alias, update BOTH or
TypeScript and Rsbuild disagree silently.

Currently defined:

| Alias             | Maps to           |
| ----------------- | ----------------- |
| `@/...`           | `src/`            |
| `@components/...` | `src/components/` |
| `@features/...`   | `src/features/`   |
| `@pages/...`      | `src/pages/`      |
| `@shared/...`     | `src/shared/`     |

Use the most-specific alias when one exists. Both `@/shared/stores/storeAccessor`
and `@shared/stores/storeAccessor` resolve to the same file; prefer the latter.

**Don't add a single-file alias** (`@store`, `@queryClient`). Aliases are
for folders that have grown enough to warrant their own root.

## Federation

This remote **exposes** `./App` to the host and **consumes** the host's
`./stores/store` via federation. Components NEVER import the federated
module directly — always go through the accessor.

**The import rule:**

| What                    | Use in source                                        | Don't                                                            |
| ----------------------- | ---------------------------------------------------- | ---------------------------------------------------------------- |
| Store hook              | `from '@/shared/stores/storeAccessor'`               | `from 'hostTemplate/stores/store'` (only the accessor uses this) |
| Store init (standalone) | `from '@/shared/stores/storeAccessor'` (`initStore`) | —                                                                |

The accessor handles both modes: embedded resolves the host's federated
module; standalone falls back to `createLocalStore()`. Components don't care
which they got — call `useStore(selector)` either way.

**TanStack Query is different — no accessor pattern.** The host's
`<QueryClientProvider>` propagates via React context to the embedded remote.
Standalone, `bootstrap.tsx` provides its own. In components you always just
call `useQuery()` directly.

> **Never wrap `App.tsx` in `<QueryClientProvider>` or `<BrowserRouter>`.**
> Same trap as double-wrapping a Router — embedded mode silently creates a
> second client/router and stops sharing with the host.

**Consuming a new federated module from the host:**

1. Add to `FEDERATION.REMOTES` in
   [src/shared/config/app.constants.ts](src/shared/config/app.constants.ts)
   if it's a new remote (otherwise skip — already declared).
2. Declare the module shape in
   [src/shared/types/remotes.d.ts](src/shared/types/remotes.d.ts).
3. Build an accessor wrapper in `shared/stores/` (if state) or `shared/lib/`
   (if a service) — never import the federated path from feature code.

**Singletons that MUST stay in the `shared` block** (rsbuild.config.ts):
`react`, `react-dom`, `react-router-dom`, `zustand`, `@tanstack/react-query`.
All five hold module-level state (contexts, registries, listeners) — two
copies and host/remote stop sharing. When the host adds a new singleton
library, mirror it here.

## Stores & slices

This remote does NOT define the canonical store — the host does
(`afsd.host-mfe/src/shared/stores/store.ts`, composed from slices in
`slices/`). Locally, the remote only owns:

- [storeAccessor.ts](src/shared/stores/storeAccessor.ts) — federated-or-local
  hook the rest of the codebase imports
- [localStore.ts](src/shared/stores/localStore.ts) — standalone fallback
  with the same shape as host's `AppState`
- [remotes.d.ts](src/shared/types/remotes.d.ts) — TS declaration of the
  federated module the accessor consumes

**When the host adds a slice:** mirror the new fields into BOTH
`localStore.ts` and `remotes.d.ts`. These three files (host's slices + this
repo's localStore + this repo's remotes.d.ts) form a contract. Drift between
them is a silent standalone-vs-embedded behavior bug — embedded gets the new
fields; standalone falls back to an outdated shape.

**Don't define new slices here.** Slices belong with the canonical store on
the host. If the remote needs state that's NOT shared with the host (e.g.,
remote-only UI state), use `useState`/`useReducer` or a small remote-local
zustand store — but think twice. Most cross-cutting state belongs on the
host.

## Styling

**Use semantic CSS vars from [`shared/styles/_tokens.scss`](src/shared/styles/_tokens.scss).
Never write raw colors, sizes, radii, or shadows in component styles.**

Tokens have two layers — components consume ONLY the second:

- **Palette** (`--palette-slate-500`, …) — raw scales, never consumed.
- **Semantic** (`--color-bg-surface`, `--color-text-primary`, `--space-4`,
  `--radius-md`, `--shadow-sm`, `--z-modal`, …) — theme-bound aliases.

If you need a new semantic value, add it under both `:root[data-theme='dark']`
and `:root[data-theme='light']` blocks. Theme tokens MUST match the host's —
the host's `_tokens.scss` is the canonical version; mirror changes here.

**Styling primitives:**

- `*.module.scss` colocated with the component, imported as
  `import s from './Foo.module.scss'` → `className={s.root}`.
- `_*.scss` partials in `shared/styles/` are imported by other SCSS only.
- Tailwind v4 utilities work for one-off layout. Don't use Tailwind for
  color, thematic spacing, or anything theme-responsive — use the CSS vars
  there.

The remote inherits the active theme via the federated session store:
`useStore((s) => s.theme)` reads whichever the host set, and the
`useEffect` in `App.tsx` writes `data-theme` on `<html>`.

## Configuration constants

Values shared across `rsbuild.config.ts`, `vitest.config.ts`, and source code
live in [src/shared/config/app.constants.ts](src/shared/config/app.constants.ts).
**When a literal appears in more than one place, consolidate it here.**

**Naming convention:** all consolidated-value files in this codebase use the
`*.constants.ts` suffix. If you create a new one (e.g., `routes.constants.ts`,
`theme.constants.ts`), follow the same rules below.

**File rules** (break these and build configs stop loading):

1. **Self-contained — no `@/...` alias imports.** Build configs load the
   constants file BEFORE the bundler's alias resolver wires up. Use relative
   imports or stdlib only. Pure data + types — no side effects.
2. **`as const` objects, NOT `enum`s.** `const enum` doesn't work with
   `verbatimModuleSyntax: true`; plain `enum` bloats bundles. `as const`
   gives literal types, runtime presence, and tree-shakes cleanly.
3. **Group by concern** — `FEDERATION`, `APP`, `STORAGE`, `ENV`.

**Cross-template invariants** (must match the host's `app.constants.ts`):

- `STORAGE.STORE_KEY`, `STORAGE.STORE_VERSION`
- `ENV.PUBLIC_PREFIXES`, `ENV.DEFAULT_HOST_URL`, `ENV.DEFAULT_REMOTE_URL`

When changing one of these, mirror the change on the host immediately — the
local fallback store (which uses these constants) and the host's canonical
store must produce identical persisted state. Drift means standalone-vs-
embedded behavior diverges silently.

## Tests

Colocate tests with the source they cover: `Foo/Foo.test.tsx` next to
`Foo/Foo.tsx`. Shared-helper tests live next to the helper in `shared/test/`.

**Use `renderWithProviders` for every component test.** It's the canonical
wrapper for router + TanStack Query. Don't reach for raw
`@testing-library/react`'s `render` unless the component consumes neither.

```ts
import { renderWithProviders } from '@/shared/test/renderWithProviders';

it('does the thing', () => {
  renderWithProviders(<Foo />, {
    route: '/details',  // optional, default '/'
  });
  // ...
});
```

**Federated store in tests:** components import the store via
`@/shared/stores/storeAccessor`. In tests, the accessor's federated
`import('hostTemplate/stores/store')` fails (no federation runtime), and the
accessor falls back to `createLocalStore()` automatically. No mocking
needed — just use the accessor normally.

**Seeding store state in tests:** the helper doesn't expose `seedStore`
(unlike the host) because the accessor pattern needs an `await initStore()`
to resolve first. If you need to seed:

```ts
import { initStore } from '@/shared/stores/storeAccessor';

const store = await initStore();
store.setState({ theme: 'light' }, false);
```

Canonical examples:

- [src/shared/test/renderWithProviders.test.tsx](src/shared/test/renderWithProviders.test.tsx) — query + router
- [src/shared/stores/localStore.test.ts](src/shared/stores/localStore.test.ts) — fallback store unit tests

Don't add MSW yet — defer until we have a real API surface to mock.

## Mirror the host

This template mirrors `afsd.host-mfe` 1:1 for folder structure, lib defaults,
and store shape. When you add a pattern here, check whether the host needs
a parallel addition (and vice versa). Specific cross-template invariants:

- `shared/stores/localStore.ts` shape MUST match host's `AppState` exactly
- `shared/lib/queryClient.ts` defaults MUST match host's `createQueryClient`
- `shared/types/remotes.d.ts` must declare every module the host exposes
