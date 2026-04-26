'use client';

import Link from 'next/link';

export function Footer() {
  return (
    <footer style={{ background: '#0F0D0B', color: 'var(--cream)', padding: '6rem var(--section-px) 3rem var(--section-px)', borderTop: '1px solid rgba(201,168,76,0.1)' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '4rem' }}>
        {/* Brand */}
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', color: 'var(--gold)', marginBottom: '1.5rem', fontWeight: 300 }}>Old Loom</h2>
          <p style={{ color: 'var(--cream-50)', fontSize: '0.85rem', lineHeight: 1.8, marginBottom: '2rem' }}>
            Crafted threads, embroidered stories. Premium hand-embroidered clothing for those who appreciate the art of weaving.
          </p>
        </div>

        {/* Links */}
        <div>
          <h3 style={{ fontSize: '0.75rem', color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '1.5rem' }}>Shop</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <Link href="/collections/men" style={{ color: 'var(--cream-50)', textDecoration: 'none', fontSize: '0.85rem' }}>Men</Link>
            <Link href="/collections/women" style={{ color: 'var(--cream-50)', textDecoration: 'none', fontSize: '0.85rem' }}>Women</Link>
            <Link href="/collections/couples" style={{ color: 'var(--cream-50)', textDecoration: 'none', fontSize: '0.85rem' }}>Couples</Link>
          </div>
        </div>

        <div>
          <h3 style={{ fontSize: '0.75rem', color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '1.5rem' }}>Help</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <Link href="/size-guide" style={{ color: 'var(--cream-50)', textDecoration: 'none', fontSize: '0.85rem' }}>Size Guide</Link>
            <Link href="/shipping" style={{ color: 'var(--cream-50)', textDecoration: 'none', fontSize: '0.85rem' }}>Shipping</Link>
            <Link href="/returns" style={{ color: 'var(--cream-50)', textDecoration: 'none', fontSize: '0.85rem' }}>Returns</Link>
          </div>
        </div>

        <div>
          <h3 style={{ fontSize: '0.75rem', color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '1.5rem' }}>Connect</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <a href="#" style={{ color: 'var(--cream-50)', textDecoration: 'none', fontSize: '0.85rem' }}>Instagram</a>
            <a href="#" style={{ color: 'var(--cream-50)', textDecoration: 'none', fontSize: '0.85rem' }}>WhatsApp</a>
            <a href="mailto:hello@oldloom.in" style={{ color: 'var(--cream-50)', textDecoration: 'none', fontSize: '0.85rem' }}>Email Us</a>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '5rem auto 0 auto', borderTop: '1px solid rgba(245,240,232,0.05)', paddingTop: '2rem', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem' }}>
        <p style={{ fontSize: '0.7rem', color: 'var(--cream-50)', fontFamily: 'var(--font-mono)' }}>
          © 2025 Old Loom · Handcrafted in India
        </p>
        <div style={{ display: 'flex', gap: '2rem' }}>
          <Link href="/privacy" style={{ fontSize: '0.7rem', color: 'var(--cream-50)', textDecoration: 'none' }}>Privacy Policy</Link>
          <Link href="/terms" style={{ fontSize: '0.7rem', color: 'var(--cream-50)', textDecoration: 'none' }}>Terms of Service</Link>
          <Link href="/refund" style={{ fontSize: '0.7rem', color: 'var(--cream-50)', textDecoration: 'none' }}>Refund Policy</Link>
        </div>
      </div>
    </footer>
  );
}
