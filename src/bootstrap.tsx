import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import App from './App';
import { initStore } from '@/shared/stores/storeAccessor';
import { createQueryClient } from '@/shared/lib/queryClient';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element #root was not found.');
}

// Standalone-only providers. When embedded, the host supplies both
// <BrowserRouter> and <QueryClientProvider>; this file is never executed
// in that path (the host imports `./App` directly via federation).
const queryClient = createQueryClient();

initStore().then(() => {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
        {process.env.NODE_ENV !== 'production' && (
          <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" />
        )}
      </QueryClientProvider>
    </React.StrictMode>,
  );
});
