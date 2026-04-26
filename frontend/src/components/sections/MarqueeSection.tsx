'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

const MARQUEE_TEXT = 'OLD LOOM · CRAFTED THREADS · EMBROIDERED STORIES · WEAR THE WEAVE · ';

export function MarqueeSection() {
  const track1Ref = useRef<HTMLDivElement>(null);
  const track2Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el1 = track1Ref.current;
    const el2 = track2Ref.current;
    if (!el1 || !el2) return;

    let width = el1.scrollWidth / 2; // half because we duplicate text

    // Seamless infinite scroll: track1 and track2 in tandem
    const speed = 60; // px/second

    gsap.set(el1, { x: 0 });
    gsap.set(el2, { x: width });

    const tl = gsap.timeline({ repeat: -1 });
    const dur = width / speed;

    tl.to([el1, el2], {
      x: `-=${width}`,
      duration: dur,
      ease: 'none',
      modifiers: {
        x: gsap.utils.unitize((x: number) => {
          // Wrap from -width back to 0
          return (((parseFloat(x as unknown as string) % width) + width) % width) - width;
        }),
      },
    });

    return () => { tl.kill(); };
  }, []);

  return (
    <section
      id="marquee"
      aria-hidden="true"
      style={{
        background: 'var(--dark)',
        borderTop:    '1px solid rgba(201,168,76,0.08)',
        borderBottom: '1px solid rgba(201,168,76,0.08)',
        padding: '1.75rem 0',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Fade edges */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 2,
        background: 'linear-gradient(to right, var(--dark) 0%, transparent 8%, transparent 92%, var(--dark) 100%)',
      }} />

      <div style={{ display: 'flex', position: 'relative', overflow: 'hidden' }}>
        <div
          ref={track1Ref}
          style={{ display: 'flex', whiteSpace: 'nowrap', willChange: 'transform', position: 'relative' }}
        >
          {[0, 1].map((n) => (
            <span
              key={n}
              style={{
                fontFamily: 'var(--font-heading)',
                fontWeight: 800,
                fontSize: 'clamp(1.5rem, 4vw, 3.5rem)',
                letterSpacing: '0.03em',
                color: 'var(--gold)',
                padding: '0 1rem',
                display: 'inline-block',
              }}
            >
              {MARQUEE_TEXT}
            </span>
          ))}
        </div>
        <div
          ref={track2Ref}
          style={{ display: 'flex', whiteSpace: 'nowrap', willChange: 'transform', position: 'absolute', left: 0 }}
        >
          {[0, 1].map((n) => (
            <span
              key={n}
              style={{
                fontFamily: 'var(--font-heading)',
                fontWeight: 800,
                fontSize: 'clamp(1.5rem, 4vw, 3.5rem)',
                letterSpacing: '0.03em',
                color: 'var(--gold)',
                padding: '0 1rem',
                display: 'inline-block',
              }}
            >
              {MARQUEE_TEXT}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
