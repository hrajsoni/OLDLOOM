'use client';

import { useRef, useEffect, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { gsap } from 'gsap';
import { MagneticButton } from '@/components/ui/MagneticButton';

// Dynamic import — Three.js / WebGL must not run on server
const Scene             = dynamic(() => import('@/components/3d/Scene').then((m) => ({ default: m.Scene })), { ssr: false });
const HeroSceneContents = dynamic(() => import('@/components/3d/HeroSceneContents').then((m) => ({ default: m.HeroSceneContents })), { ssr: false });

const HEADLINE = 'WEAR THE CRAFT';

export function HeroSection() {
  const sectionRef     = useRef<HTMLElement>(null);
  const eyeRef         = useRef<HTMLParagraphElement>(null);
  const headlineRef    = useRef<HTMLHeadingElement>(null);
  const ruleRef        = useRef<HTMLDivElement>(null);
  const subtitleRef    = useRef<HTMLParagraphElement>(null);
  const ctaRef         = useRef<HTMLDivElement>(null);
  const scrollProgress = useRef(0);

  // ── Track scroll progress ──────────────────────────────────────────────────
  useEffect(() => {
    const onScroll = () => {
      const maxScroll = document.body.scrollHeight - window.innerHeight;
      if (maxScroll > 0) scrollProgress.current = window.scrollY / maxScroll;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // ── GSAP entry animation ───────────────────────────────────────────────────
  useEffect(() => {
    if (!headlineRef.current || !subtitleRef.current || !ctaRef.current) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 0.5 });

      // Eyeline fade in
      tl.from(eyeRef.current!, {
        opacity: 0,
        y: 10,
        duration: 0.8,
        ease: 'power3.out',
      });

      // Word-by-word reveal
      const words = headlineRef.current!.querySelectorAll('.word-inner');
      tl.from(
        words,
        {
          yPercent: 110,
          duration: 1.1,
          stagger: 0.07,
          ease: 'power4.out',
        },
        '-=0.4'
      );

      // Gold rule expanding from center
      tl.from(
        ruleRef.current!,
        { scaleX: 0, duration: 0.7, ease: 'power3.out', transformOrigin: 'center' },
        '-=0.5'
      );

      tl.from(
        subtitleRef.current!,
        { opacity: 0, y: 16, duration: 0.8, ease: 'power3.out' },
        '-=0.4'
      );

      tl.from(
        ctaRef.current!,
        { opacity: 0, y: 14, duration: 0.7, ease: 'power3.out' },
        '-=0.5'
      );
    });

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="hero"
      style={{
        position: 'relative',
        height: '100vh',
        minHeight: '640px',
        background: 'var(--dark)',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* ── Full-screen 3D Canvas ── */}
      <div style={{ position: 'absolute', inset: 0 }}>
        <Suspense fallback={null}>
          <Scene
            camera={{ position: [0, 0, 5], fov: 42 }}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
          >
            <HeroSceneContents scrollProgress={scrollProgress} />
          </Scene>
        </Suspense>
      </div>

      {/* ── Radial vignette — strengthened to frame tunnel entrance ── */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(ellipse 60% 55% at 50% 50%, transparent 15%, rgba(26,22,18,0.5) 60%, rgba(26,22,18,0.95) 100%)',
          pointerEvents: 'none',
        }}
      />

      {/* ── Horizontal edge fade — frames the scene left & right ── */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(90deg, rgba(26,22,18,0.82) 0%, transparent 25%, transparent 75%, rgba(26,22,18,0.82) 100%)',
          pointerEvents: 'none',
        }}
      />

      {/* ── Bottom fade — blends into the next section ── */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '30%',
          background: 'linear-gradient(to bottom, transparent, var(--dark))',
          pointerEvents: 'none',
        }}
      />

      {/* ── HTML Overlay ── */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          textAlign: 'center',
          padding: '0 var(--section-px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1.2rem',
          maxWidth: '960px',
        }}
      >
        {/* Eye-line label */}
        <p
          ref={eyeRef}
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '0.6rem',
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
            color: 'var(--gold)',
            margin: 0,
            opacity: 0.8,
          }}
        >
          Old Loom · Embroidery Redefined · Est. 2025
        </p>

        {/* Headline with word-clip animation */}
        <h1
          ref={headlineRef}
          aria-label={HEADLINE}
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 200,
            fontSize: 'clamp(3.8rem, 11vw, 10rem)',
            letterSpacing: '-0.02em',
            lineHeight: 0.93,
            color: 'var(--cream)',
            display: 'flex',
            gap: '0.22em',
            flexWrap: 'wrap',
            justifyContent: 'center',
            margin: 0,
          }}
        >
          {HEADLINE.split(' ').map((word, i) => (
            <span
              key={i}
              style={{ display: 'inline-block', overflow: 'hidden', lineHeight: 1.05 }}
            >
              <span
                className="word-inner"
                style={{
                  display: 'inline-block',
                  color: i === 2 ? 'var(--gold)' : 'var(--cream)',
                  fontStyle: i === 2 ? 'italic' : 'normal',
                }}
              >
                {word}
              </span>
            </span>
          ))}
        </h1>

        {/* Gold horizontal rule — expands from center on reveal */}
        <div
          ref={ruleRef}
          style={{
            width: '72px',
            height: '1px',
            background: 'var(--gold)',
            opacity: 0.55,
            margin: '0.1rem 0',
          }}
        />

        {/* Supporting copy — secondary, small */}
        <p
          ref={subtitleRef}
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '0.68rem',
            letterSpacing: '0.06em',
            color: 'var(--cream-50)',
            margin: 0,
            maxWidth: '340px',
            lineHeight: 1.8,
          }}
        >
          Handcrafted embroidery for those who believe clothing is a language.
        </p>

        {/* Magnetic CTAs */}
        <div ref={ctaRef} style={{ display: 'flex', gap: '1rem', marginTop: '0.4rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <MagneticButton
            variant="primary"
            href="/collections/men"
            id="hero-cta-explore"
          >
            Explore Collection ↗
          </MagneticButton>
          <MagneticButton
            variant="outline"
            href="/about"
            id="hero-cta-story"
          >
            Our Story
          </MagneticButton>
        </div>
      </div>

      {/* ── Scroll indicator ── */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          bottom: '2.2rem',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.45rem',
          opacity: 0.4,
          zIndex: 10,
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '0.5rem',
            letterSpacing: '0.25em',
            color: 'var(--cream)',
            textTransform: 'uppercase',
          }}
        >
          Scroll
        </span>
        <div
          style={{
            width: '1px',
            height: '44px',
            background: 'linear-gradient(to bottom, var(--gold), transparent)',
            animation: 'scrollPulse 2.2s ease-in-out infinite',
          }}
        />
        <style>{`
          @keyframes scrollPulse {
            0%, 100% { opacity: 0.3; transform: scaleY(0.75); }
            50%       { opacity: 0.9; transform: scaleY(1); }
          }
        `}</style>
      </div>
    </section>
  );
}
