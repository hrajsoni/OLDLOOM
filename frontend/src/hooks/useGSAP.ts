'use client';

import { useEffect, useRef, MutableRefObject } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

gsap.registerPlugin(ScrollTrigger, SplitText);

// ── useGSAPReveal ──────────────────────────────────────────────────────────────
/**
 * Reveal an element from below on scroll into view.
 * @param options - GSAP ScrollTrigger options
 */
export function useGSAPReveal<T extends HTMLElement>(
  options: {
    y?: number;
    opacity?: number;
    duration?: number;
    delay?: number;
    stagger?: number;
    start?: string;
  } = {}
): MutableRefObject<T | null> {
  const ref = useRef<T | null>(null);
  const { y = 60, opacity = 0, duration = 0.9, delay = 0, start = 'top 85%' } = options;

  useEffect(() => {
    if (!ref.current) return;

    const ctx = gsap.context(() => {
      gsap.from(ref.current!, {
        y,
        opacity,
        duration,
        delay,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: ref.current,
          start,
          toggleActions: 'play none none none',
        },
      });
    }, ref);

    return () => ctx.revert();
  }, [y, opacity, duration, delay, start]);

  return ref;
}

// ── useScrollProgress ──────────────────────────────────────────────────────────
/**
 * Returns a ref to the trigger element and a GSAP scrollTrigger progress (0-1).
 * Use with R3F useFrame to drive 3D animations from scroll.
 */
export function useScrollProgress<T extends HTMLElement>(start = 'top top', end = 'bottom bottom') {
  const ref = useRef<T | null>(null);
  const progress = useRef(0);

  useEffect(() => {
    if (!ref.current) return;

    const trigger = ScrollTrigger.create({
      trigger: ref.current,
      start,
      end,
      scrub: true,
      onUpdate: (self) => {
        progress.current = self.progress;
      },
    });

    return () => trigger.kill();
  }, [start, end]);

  return { ref, progress };
}

// ── useParallax ────────────────────────────────────────────────────────────────
/**
 * Simple vertical parallax — element moves at `speed` fraction of scroll.
 */
export function useParallax<T extends HTMLElement>(
  speed = 0.3
): MutableRefObject<T | null> {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    if (!ref.current) return;

    const ctx = gsap.context(() => {
      gsap.to(ref.current!, {
        yPercent: -speed * 100,
        ease: 'none',
        scrollTrigger: {
          trigger: ref.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      });
    }, ref);

    return () => ctx.revert();
  }, [speed]);

  return ref;
}

// ── useMagneticEffect ──────────────────────────────────────────────────────────
/**
 * Makes an element magneticaly attract towards the cursor on hover.
 */
export function useMagneticEffect<T extends HTMLElement>(
  strength = 0.4
): MutableRefObject<T | null> {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const xTo = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'power3.out' });
    const yTo = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'power3.out' });

    const handleMouseMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      xTo((e.clientX - cx) * strength);
      yTo((e.clientY - cy) * strength);
    };

    const handleMouseLeave = () => {
      xTo(0);
      yTo(0);
    };

    el.addEventListener('mousemove', handleMouseMove);
    el.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      el.removeEventListener('mousemove', handleMouseMove);
      el.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [strength]);

  return ref;
}

// ── useSplitTextReveal ─────────────────────────────────────────────────────────
/**
 * Split headline into characters and animate them in on scroll.
 */
export function useSplitTextReveal<T extends HTMLElement>(
  { stagger = 0.03, duration = 0.8, delay = 0 } = {}
): MutableRefObject<T | null> {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    if (!ref.current) return;

    const ctx = gsap.context(() => {
      const split = new SplitText(ref.current!, { type: 'chars,words' });
      gsap.from(split.chars, {
        yPercent: 110,
        opacity: 0,
        duration,
        stagger,
        delay,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: ref.current,
          start: 'top 90%',
          toggleActions: 'play none none none',
        },
      });
    }, ref);

    return () => ctx.revert();
  }, [stagger, duration, delay]);

  return ref;
}

// ── useReducedMotion ───────────────────────────────────────────────────────────
/**
 * Returns true if user has requested reduced motion.
 */
export function useReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
