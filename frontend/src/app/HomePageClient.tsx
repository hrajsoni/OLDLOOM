'use client';

import dynamic from 'next/dynamic';

// Pure client render — no server HTML, no hydration mismatch
const HomeClient = dynamic(
  () => import('@/components/HomeClient').then((m) => ({ default: m.HomeClient })),
  {
    ssr: false,
    loading: () => (
      <div
        style={{
          minHeight: '100vh',
          background: '#1A1612',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <p style={{ fontFamily: 'monospace', color: '#C9A84C', fontSize: '0.7rem', letterSpacing: '0.3em' }}>
          Loading…
        </p>
      </div>
    ),
  }
);

export function HomePageClient() {
  return <HomeClient />;
}
