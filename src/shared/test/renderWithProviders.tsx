import { type ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, type RenderOptions, type RenderResult } from '@testing-library/react';

type Options = Omit<RenderOptions, 'wrapper'> & {
  /** Initial URL the MemoryRouter sits on. Default `/`. */
  route?: string;
  /** Override the test QueryClient (e.g. to assert on cache state after). */
  queryClient?: QueryClient;
};

/**
 * Canonical render helper for component/integration tests.
 *
 * Wires the two top-level providers production code expects:
 *   - MemoryRouter (replaces BrowserRouter for tests)
 *   - QueryClientProvider with a retry-disabled client
 *
 * Store seeding is intentionally NOT exposed here — the remote consumes the
 * federated store via `storeAccessor`, which falls back to a local zustand
 * instance in test mode. If a test needs to seed store state, await
 * `initStore()` first and then call `.setState()` on the resolved hook
 * (see AGENTS.md "Tests" section for the pattern).
 */
export function renderWithProviders(
  ui: ReactNode,
  { route = '/', queryClient, ...renderOptions }: Options = {},
): RenderResult & { queryClient: QueryClient } {
  const client =
    queryClient ??
    new QueryClient({
      defaultOptions: {
        queries: { retry: false, gcTime: 0 },
        mutations: { retry: false },
      },
    });

  const result = render(ui, {
    wrapper: ({ children }) => (
      <QueryClientProvider client={client}>
        <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
      </QueryClientProvider>
    ),
    ...renderOptions,
  });

  return { ...result, queryClient: client };
}
