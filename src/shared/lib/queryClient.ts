import { QueryClient, QueryCache, MutationCache } from '@tanstack/react-query';
import { isApiError } from './api';
import { logger } from './logger';

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
    queryCache: new QueryCache({
      onError: (error, query) => {
        logger.event({
          name: 'query.error',
          level: 'error',
          message: `Query failed: ${query.queryKey.join('.')}`,
          context: { queryKey: query.queryKey },
          error,
        });
      },
    }),
    mutationCache: new MutationCache({
      onError: (error, _vars, _ctx, mutation) => {
        logger.event({
          name: 'mutation.error',
          level: 'error',
          message: `Mutation failed: ${mutation.options.mutationKey?.join('.') ?? '<unkeyed>'}`,
          context: { mutationKey: mutation.options.mutationKey },
          error,
        });
      },
    }),
    defaultOptions: {
      queries: {
        staleTime: 60_000,
        gcTime: 5 * 60_000,
        refetchOnWindowFocus: true,
        retry: (failureCount, error) => {
          const status = isApiError(error) ? error.status : null;
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
