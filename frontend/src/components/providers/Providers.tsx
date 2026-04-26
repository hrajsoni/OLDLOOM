'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { SessionProvider } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { LenisProvider } from './LenisProvider';
import { useCartStore } from '@/store/cartStore';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            gcTime: 5 * 60 * 1000,
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  useEffect(() => {
    useCartStore.persist.rehydrate();
  }, []);

  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <LenisProvider>
          {children}
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: '#3D2B1F',
                color: '#F5F0E8',
                border: '1px solid rgba(201, 168, 76, 0.2)',
                fontFamily: "'DM Mono', monospace",
                fontSize: '0.75rem',
                letterSpacing: '0.05em',
              },
              success: {
                iconTheme: { primary: '#C9A84C', secondary: '#1A1612' },
              },
              error: {
                iconTheme: { primary: '#B5451B', secondary: '#F5F0E8' },
              },
            }}
          />
        </LenisProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </SessionProvider>
  );
}
