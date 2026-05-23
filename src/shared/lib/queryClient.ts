import { QueryClient } from '@tanstack/react-query';
import type { ApiError } from './api';

/**
 * Standalone fallback QueryClient factory for the AFSD remote.
 *
 * In embedded mode the remote inherits the host's QueryClient via React
 * context (host wraps `<QueryClientProvider>` around its routes; the
 * remote's `<App />` renders inside one of those routes). The factory
 * below is only used by `bootstrap.tsx` for standalone mode.
 *
 * Must mirror the host's defaults at
 * `afsd.host-mfe/src/shared/lib/queryClient.ts`. When the host changes
 * defaults, mirror them here.
 */
export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60_000,
        gcTime: 5 * 60_000,
        refetchOnWindowFocus: true,
        retry: (failureCount, error) => {
          const status = (error as ApiError | null)?.status ?? null;
          if (status !== null && status >= 400 && status < 500) return false;
          return failureCount < 2;
        },
      },
      mutations: {
        retry: 0,
      },
    },
  });
}
