'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { gsap } from 'gsap';
import { CustomCursor } from '@/components/ui/CustomCursor';

export default function OrderSuccessPage() {
  const checkmarkRef = useRef<SVGPathElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const confettiRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Checkmark animation
    if (checkmarkRef.current) {
      const length = checkmarkRef.current.getTotalLength();
      gsap.set(checkmarkRef.current, { strokeDasharray: length, strokeDashoffset: length });
      gsap.to(checkmarkRef.current, { strokeDashoffset: 0, duration: 1.5, ease: 'power2.inOut', delay: 0.2 });
    }

    // Typewriter effect
    if (textRef.current) {
      const chars = textRef.current.innerText.split('');
      textRef.current.innerText = '';
      chars.forEach((char) => {
        const span = document.createElement('span');
        span.innerText = char;
        span.style.opacity = '0';
        textRef.current?.appendChild(span);
      });
      gsap.to(textRef.current.children, { opacity: 1, duration: 0.05, stagger: 0.03, ease: 'none', delay: 1 });
    }

    // Confetti
    if (confettiRef.current) {
      for (let i = 0; i < 30; i++) {
        const particle = document.createElement('div');
        particle.style.cssText = `
          position: absolute; width: 6px; height: 6px; background: var(--gold); border-radius: 50%;
          top: 50%; left: 50%; transform: translate(-50%, -50%); opacity: 0; pointer-events: none;
        `;
        confettiRef.current.appendChild(particle);
        const angle = (Math.PI * 2 * i) / 30;
        const radius = 100 + Math.random() * 150;
        gsap.to(particle, {
          x: Math.cos(angle) * radius,
          y: Math.sin(angle) * radius,
          opacity: 1,
          duration: 0.8 + Math.random() * 0.5,
          ease: 'power3.out',
          delay: 0.5,
          onComplete: () => {
            gsap.to(particle, { y: '+=100', opacity: 0, duration: 1 });
          }
        });
      }
    }
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '5rem', position: 'relative', overflow: 'hidden' }}>
      <CustomCursor />
      <div ref={confettiRef} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} />
      <div style={{ textAlign: 'center', zIndex: 10, maxWidth: '600px', padding: '0 2rem' }}>
        <svg viewBox="0 0 100 100" width="120" height="120" style={{ margin: '0 auto 2rem' }}>
          <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(201,168,76,0.2)" strokeWidth="2" />
          <path
            ref={checkmarkRef}
            d="M30 50 L45 65 L70 35"
            fill="none"
            stroke="var(--gold)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '3rem', color: 'var(--cream)', marginBottom: '1rem', fontWeight: 300 }}>
          Order Confirmed
        </h1>
        <div style={{ background: 'rgba(61,43,31,0.3)', border: '1px solid rgba(201,168,76,0.2)', padding: '2rem', borderRadius: '8px', marginBottom: '2rem' }}>
          <p ref={textRef} style={{ fontFamily: 'var(--font-body)', fontSize: '1rem', color: 'var(--cream-50)', lineHeight: 1.8, margin: 0 }}>
            Thank you for choosing Old Loom. Your embroidered pieces are being prepared by our artisans. A confirmation email has been sent to you.
          </p>
        </div>
        <Link href="/" style={{ padding: '1rem 2rem', background: 'var(--gold)', color: 'var(--dark)', textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 600, borderRadius: '4px', display: 'inline-block' }}>
          Return Home
        </Link>
      </div>
    </div>
  );
}
