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
