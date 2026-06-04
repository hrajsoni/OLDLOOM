'use client';

import Link from 'next/link';

export function Footer() {
  return (
    <footer 
      className="pb-[calc(60px+env(safe-area-inset-bottom)+1.5rem)] lg:pb-16"
      style={{ 
        background: '#0F0D0B', 
        color: 'var(--cream)', 
        paddingTop: '6rem', 
        paddingLeft: 'var(--section-px)', 
        paddingRight: 'var(--section-px)', 
        borderTop: '1px solid rgba(201,168,76,0.1)' 
      }}
    >
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
        <p style={{ 
          fontSize: '0.65rem', 
          color: 'var(--cream-50)', 
          fontFamily: 'var(--font-body)', 
          letterSpacing: '0.12em', 
          textTransform: 'uppercase',
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          flexWrap: 'wrap'
        }}>
          <span>© 2025 Old Loom</span>
          <span style={{ color: 'rgba(245,240,232,0.15)' }}>|</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
            Handcrafted with love by{' '}
            <span style={{ color: 'var(--gold)', fontWeight: 600, letterSpacing: '0.18em' }}>
              Harshit Raj
            </span>
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', marginLeft: '0.1rem' }}>
            <svg width="14" height="10" viewBox="0 0 3 2" style={{ borderRadius: '1px', boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }} aria-label="India Flag">
              <rect width="3" height="2" fill="#FF9933" />
              <rect y="0.666" width="3" height="1.333" fill="#FFFFFF" />
              <rect y="1.333" width="3" height="0.667" fill="#138808" />
              <circle cx="1.5" cy="1" r="0.16" fill="#000080" />
            </svg>
          </span>
        </p>
        <div style={{ display: 'flex', gap: '2rem' }}>
          <Link href="/privacy" style={{ fontSize: '0.75rem', color: 'var(--cream-50)', textDecoration: 'none' }}>Privacy Policy</Link>
          <Link href="/terms" style={{ fontSize: '0.75rem', color: 'var(--cream-50)', textDecoration: 'none' }}>Terms of Service</Link>
          <Link href="/refund" style={{ fontSize: '0.75rem', color: 'var(--cream-50)', textDecoration: 'none' }}>Refund Policy</Link>
        </div>
      </div>
    </footer>
  );
}
