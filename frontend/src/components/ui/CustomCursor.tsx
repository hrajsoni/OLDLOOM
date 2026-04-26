'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

export function CustomCursor() {
  const cursorRef   = useRef<HTMLDivElement>(null);
  const followerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Touch device ── hide cursor
    if (window.matchMedia('(pointer: coarse)').matches) return;

    const cursor   = cursorRef.current!;
    const follower = followerRef.current!;

    // quickTo for lag/smoothness
    const xCursor  = gsap.quickTo(cursor,   'x', { duration: 0.08, ease: 'none' });
    const yCursor  = gsap.quickTo(cursor,   'y', { duration: 0.08, ease: 'none' });
    const xFollow  = gsap.quickTo(follower, 'x', { duration: 0.5,  ease: 'power3.out' });
    const yFollow  = gsap.quickTo(follower, 'y', { duration: 0.5,  ease: 'power3.out' });

    const onMove = (e: MouseEvent) => {
      xCursor(e.clientX);
      yCursor(e.clientY);
      xFollow(e.clientX);
      yFollow(e.clientY);
    };

    const onEnterInteractive = () => {
      gsap.to(follower, { scale: 2.5, opacity: 0.6, duration: 0.3 });
      gsap.to(cursor,   { scale: 0.5, duration: 0.2 });
    };
    const onLeaveInteractive = () => {
      gsap.to(follower, { scale: 1,   opacity: 1,   duration: 0.3 });
      gsap.to(cursor,   { scale: 1,   duration: 0.2 });
    };

    window.addEventListener('mousemove', onMove);

    // Expand on interactive elements
    const interactives = document.querySelectorAll('a, button, [data-cursor-expand]');
    interactives.forEach((el) => {
      el.addEventListener('mouseenter', onEnterInteractive);
      el.addEventListener('mouseleave', onLeaveInteractive);
    });

    // Hide native cursor
    document.documentElement.style.cursor = 'none';

    return () => {
      window.removeEventListener('mousemove', onMove);
      document.documentElement.style.cursor = '';
    };
  }, []);

  return (
    <>
      {/* Dot cursor */}
      <div
        ref={cursorRef}
        aria-hidden="true"
        style={{
          position: 'fixed',
          top: -6,
          left: -6,
          width: 12,
          height: 12,
          borderRadius: '50%',
          background: 'var(--gold)',
          pointerEvents: 'none',
          zIndex: 9999,
          mixBlendMode: 'difference',
          transform: 'translate(-50%, -50%)',
        }}
      />
      {/* Ring follower */}
      <div
        ref={followerRef}
        aria-hidden="true"
        style={{
          position: 'fixed',
          top: -20,
          left: -20,
          width: 40,
          height: 40,
          borderRadius: '50%',
          border: '1px solid rgba(201,168,76,0.6)',
          pointerEvents: 'none',
          zIndex: 9998,
          transform: 'translate(-50%, -50%)',
        }}
      />
    </>
  );
}
