'use client';

import { useRef, useEffect, ReactNode, ButtonHTMLAttributes } from 'react';
import { gsap } from 'gsap';

interface MagneticButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  strength?: number;
  className?: string;
  variant?: 'primary' | 'outline' | 'ghost';
  href?: string;
}

export function MagneticButton({
  children,
  strength = 0.35,
  className = '',
  variant = 'primary',
  href,
  ...rest
}: MagneticButtonProps) {
  const ref = useRef<HTMLButtonElement | HTMLAnchorElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia('(pointer: coarse)').matches) return;

    const xTo = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'power3.out' });
    const yTo = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'power3.out' });

    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const cx   = rect.left + rect.width  / 2;
      const cy   = rect.top  + rect.height / 2;
      xTo((e.clientX - cx) * strength);
      yTo((e.clientY - cy) * strength);
    };
    const onLeave = () => { xTo(0); yTo(0); };

    el.addEventListener('mousemove', onMove as EventListener);
    el.addEventListener('mouseleave', onLeave);
    return () => {
      el.removeEventListener('mousemove', onMove as EventListener);
      el.removeEventListener('mouseleave', onLeave);
    };
  }, [strength]);

  const baseStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    padding: '1rem 2.25rem',
    fontFamily: 'var(--font-body)',
    fontSize: '0.7rem',
    letterSpacing: '0.2em',
    textTransform: 'uppercase',
    borderRadius: '3px',
    cursor: 'none',
    border: 'none',
    textDecoration: 'none',
    transition: 'box-shadow 0.3s ease, background 0.3s ease',
    ...(variant === 'primary' && {
      background: 'var(--gold)',
      color:      'var(--dark)',
      fontWeight: 500,
    }),
    ...(variant === 'outline' && {
      background:  'transparent',
      color:       'var(--cream)',
      border:      '1px solid rgba(245,240,232,0.3)',
    }),
    ...(variant === 'ghost' && {
      background: 'transparent',
      color:      'var(--cream-50)',
    }),
  };

  if (href) {
    return (
      <a
        ref={ref as React.RefObject<HTMLAnchorElement>}
        href={href}
        style={baseStyle}
        className={className}
      >
        {children}
      </a>
    );
  }

  return (
    <button
      ref={ref as React.RefObject<HTMLButtonElement>}
      style={baseStyle}
      className={className}
      {...rest}
    >
      {children}
    </button>
  );
}
