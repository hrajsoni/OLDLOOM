'use client';

import { useRef, useEffect } from 'react';
import Link from 'next/link';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface Collection {
  id: string;
  label: string;
  tag: string;
  description: string;
  href: string;
  bg: string;         // gradient
  accent: string;     // shimmer color
  count: string;
}

const COLLECTIONS: Collection[] = [
  {
    id:          'men',
    label:       'MEN',
    tag:         'Heritage Collection',
    description: 'Bold embroidery meets modern silhouettes — T-shirts, hoodies, joggers & caps for the discerning man.',
    href:        '/collections/men',
    bg:          'linear-gradient(145deg, #1A1612 0%, #2E1E14 50%, #3D2B1F 100%)',
    accent:      '#C9A84C',
    count:       '48 styles',
  },
  {
    id:          'women',
    label:       'WOMEN',
    tag:         'Bloom Collection',
    description: 'Floral embroidery with structured elegance — co-ord sets, kurtis & accessories that tell a story.',
    href:        '/collections/women',
    bg:          'linear-gradient(145deg, #1A0F0E 0%, #2E1410 50%, #3D1F1A 100%)',
    accent:      '#B5451B',
    count:       '64 styles',
  },
  {
    id:          'couples',
    label:       'COUPLES',
    tag:         'Twin Threads',
    description: 'Matching embroidered sets for two — co-ord outfits that celebrate togetherness with craft.',
    href:        '/collections/couples',
    bg:          'linear-gradient(145deg, #100E14 0%, #1E1A28 50%, #2B2438 100%)',
    accent:      '#9B8FC4',
    count:       '32 sets',
  },
];

function CollectionCard({ col, index }: { col: Collection; index: number }) {
  const cardRef   = useRef<HTMLAnchorElement>(null);
  const glowRef   = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const card = cardRef.current;
    if (!card || window.matchMedia('(pointer: coarse)').matches) return;

    const xTo = gsap.quickTo(card, 'rotationY', { duration: 0.5, ease: 'power3.out' });
    const yTo = gsap.quickTo(card, 'rotationX', { duration: 0.5, ease: 'power3.out' });

    const onMove = (e: MouseEvent) => {
      const rect = card.getBoundingClientRect();
      const rx   = ((e.clientY - rect.top)  / rect.height - 0.5) * -14;
      const ry   = ((e.clientX - rect.left) / rect.width  - 0.5) *  14;
      xTo(ry);
      yTo(rx);

      // Move glow
      if (glowRef.current) {
        const px = ((e.clientX - rect.left) / rect.width)  * 100;
        const py = ((e.clientY - rect.top)  / rect.height) * 100;
        glowRef.current.style.background = `radial-gradient(circle at ${px}% ${py}%, ${col.accent}25 0%, transparent 65%)`;
      }
    };
    const onLeave = () => { xTo(0); yTo(0); };

    card.addEventListener('mousemove', onMove);
    card.addEventListener('mouseleave', onLeave);
    return () => {
      card.removeEventListener('mousemove', onMove);
      card.removeEventListener('mouseleave', onLeave);
    };
  }, [col.accent]);

  return (
    <Link
      ref={cardRef}
      href={col.href}
      id={`collection-card-${col.id}`}
      style={{
        display: 'block',
        background: col.bg,
        border: `1px solid ${col.accent}22`,
        borderRadius: '12px',
        overflow: 'hidden',
        textDecoration: 'none',
        position: 'relative',
        transformStyle: 'preserve-3d',
        willChange: 'transform',
        transition: 'box-shadow 0.4s ease',
        cursor: 'none',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = `0 32px 64px rgba(0,0,0,0.5), 0 0 40px ${col.accent}18`;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = 'none';
      }}
    >
      {/* Cursor glow */}
      <div ref={glowRef} style={{ position: 'absolute', inset: 0, borderRadius: '12px', transition: 'background 0.1s linear', pointerEvents: 'none', zIndex: 1 }} />

      {/* Embroidery pattern background */}
      <div style={{ position: 'absolute', inset: 0, opacity: 0.04, backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23${col.accent.slice(1)}' stroke-width='0.5'%3E%3Cpath d='M30 0 L30 60 M0 30 L60 30'/%3E%3Ccircle cx='30' cy='30' r='20'/%3E%3Ccircle cx='30' cy='30' r='10'/%3E%3C/g%3E%3C/svg%3E")` }} />

      <div style={{ padding: '2.5rem', position: 'relative', zIndex: 2, minHeight: '360px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
        {/* Tag */}
        <span style={{ marginBottom: 'auto', display: 'inline-block', padding: '0.25rem 0.6rem', background: `${col.accent}18`, color: col.accent, fontFamily: 'var(--font-body)', fontSize: '0.58rem', letterSpacing: '0.15em', textTransform: 'uppercase', borderRadius: '100px', border: `1px solid ${col.accent}30`, width: 'fit-content' }}>
          {col.tag}
        </span>

        <div style={{ marginTop: '4rem' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.5rem, 4vw, 3.5rem)', fontWeight: 200, color: 'var(--cream)', letterSpacing: '-0.02em', marginBottom: '0.75rem' }}>
            {col.label}
          </h3>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.72rem', lineHeight: 1.7, color: 'rgba(245,240,232,0.5)', marginBottom: '1.25rem' }}>
            {col.description}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.6rem', color: col.accent, letterSpacing: '0.15em', textTransform: 'uppercase' }}>
              {col.count}
            </span>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.65rem', color: 'var(--cream-50)', letterSpacing: '0.1em' }}>
              Shop Now →
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export function CollectionsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const gridRef    = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!gridRef.current) return;
    const cards = gridRef.current.querySelectorAll('a');
    const ctx = gsap.context(() => {
      gsap.from(cards, {
        y: 80,
        opacity: 0,
        rotationY: 12,
        duration: 0.9,
        stagger: 0.12,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: gridRef.current,
          start: 'top 80%',
          toggleActions: 'play none none none',
        },
      });
    }, gridRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="collections"
      style={{ padding: 'var(--section-py) var(--section-px)', background: 'var(--dark)' }}
    >
      {/* Header */}
      <div style={{ marginBottom: '3.5rem', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.6rem', letterSpacing: '0.25em', color: 'var(--gold)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
            Collections
          </p>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 4vw, 4rem)', fontWeight: 200, color: 'var(--cream)', letterSpacing: '-0.02em' }}>
            Shop the <em style={{ color: 'var(--gold)', fontStyle: 'italic' }}>Craft</em>
          </h2>
        </div>
        <Link
          href="/collections/men"
          style={{ fontFamily: 'var(--font-body)', fontSize: '0.65rem', color: 'var(--cream-50)', letterSpacing: '0.1em', textDecoration: 'none', borderBottom: '1px solid rgba(245,240,232,0.2)', paddingBottom: '2px' }}
        >
          View All →
        </Link>
      </div>

      {/* 3-column grid */}
      <div
        ref={gridRef}
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.5rem',
          perspective: '1000px',
        }}
      >
        {COLLECTIONS.map((col, i) => (
          <CollectionCard key={col.id} col={col} index={i} />
        ))}
      </div>
    </section>
  );
}
