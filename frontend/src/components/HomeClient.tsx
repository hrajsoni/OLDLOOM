'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { MarqueeSection }     from '@/components/sections/MarqueeSection';
import { CollectionsSection } from '@/components/sections/CollectionsSection';
import { CraftSection }       from '@/components/sections/CraftSection';
import { Navbar }             from '@/components/ui/Navbar';
import { Newsletter }         from '@/components/ui/Newsletter';

// No ssr: false needed here if we use mounted check
const HeroSection  = dynamic(
  () => import('@/components/sections/HeroSection').then((m) => ({ default: m.HeroSection })),
  { ssr: false }
);

const CustomCursor = dynamic(
  () => import('@/components/ui/CustomCursor').then((m) => ({ default: m.CustomCursor })),
  { ssr: false }
);

export function HomeClient() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div style={{ height: '100vh', background: '#1A1612', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ fontFamily: 'monospace', color: '#C9A84C', fontSize: '0.7rem', letterSpacing: '0.25em' }}>
          INITIALIZING…
        </p>
      </div>
    );
  }

  return (
    <>
      <CustomCursor />
      <Navbar />

      <main id="main-content">
        <HeroSection />
        <MarqueeSection />
        <CollectionsSection />
        <CraftSection />
        <Newsletter />

        <footer
          style={{
            background: '#3D2B1F',
            borderTop: '1px solid rgba(201,168,76,0.1)',
            padding: '3rem var(--section-px) calc(3rem + 80px) var(--section-px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <p style={{ fontFamily: 'monospace', fontSize: '0.65rem', color: 'rgba(245,240,232,0.5)', letterSpacing: '0.1em' }}>
            © 2025 Old Loom. All rights reserved.
          </p>
          <p style={{ fontFamily: 'Georgia, serif', fontSize: '0.9rem', fontStyle: 'italic', color: '#C9A84C' }}>
            Crafted with love in India by Harshit Raj 🇮🇳
          </p>
        </footer>
      </main>
    </>
  );
}
