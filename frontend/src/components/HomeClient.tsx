'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { MarqueeSection }     from '@/components/sections/MarqueeSection';
import { CollectionsSection } from '@/components/sections/CollectionsSection';
import { CraftSection }       from '@/components/sections/CraftSection';
import { FeaturedSection }    from '@/components/sections/FeaturedSection';
import { TrustSection }       from '@/components/sections/TrustSection';
import { TestimonialsSection } from '@/components/sections/TestimonialsSection';
import { Navbar }             from '@/components/ui/Navbar';
import { AnnouncementBar }    from '@/components/ui/AnnouncementBar';
import { Newsletter }         from '@/components/ui/Newsletter';
import { Footer }             from '@/components/ui/Footer';
import { CartDrawer }         from '@/components/ui/CartDrawer';

const HeroSection = dynamic(
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
      <AnnouncementBar />
      <Navbar />

      <main id="main-content">
        <HeroSection />
        <MarqueeSection />
        <CollectionsSection />
        <FeaturedSection />
        <CraftSection />
        <TrustSection />
        <TestimonialsSection />
        <Newsletter />
      </main>

      <Footer />
      <CartDrawer />
    </>
  );
}
