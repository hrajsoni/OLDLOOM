'use client';

import Link from 'next/link';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description: string;
  ctaText?: string;
  ctaHref?: string;
}

export function EmptyState({ icon = '🧶', title, description, ctaText, ctaHref }: EmptyStateProps) {
  return (
    <div style={{ textAlign: 'center', padding: '4rem 2rem', background: 'rgba(61,43,31,0.2)', border: '1px dashed rgba(201,168,76,0.2)', borderRadius: '8px' }}>
      <div style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>{icon}</div>
      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', color: 'var(--cream)', marginBottom: '1rem' }}>{title}</h3>
      <p style={{ fontFamily: 'var(--font-body)', color: 'var(--cream-50)', marginBottom: '2.5rem', maxWidth: '400px', margin: '0 auto 2.5rem auto', lineHeight: 1.6 }}>{description}</p>
      {ctaText && ctaHref && (
        <Link href={ctaHref} style={{ display: 'inline-block', padding: '1rem 2rem', background: 'var(--gold)', color: 'var(--dark)', textDecoration: 'none', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, fontSize: '0.8rem' }}>
          {ctaText}
        </Link>
      )}
    </div>
  );
}
