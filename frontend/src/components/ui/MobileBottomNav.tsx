'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCartStore } from '@/store/cartStore';

export function MobileBottomNav() {
  const pathname = usePathname();
  const itemCount = useCartStore((s) => s.itemCount());
  const openCart  = useCartStore((s) => s.openCart);

  const navItems = [
    { label: 'Home',        icon: '🏠', href: '/' },
    { label: 'Collections', icon: '🧵', href: '/collections/men' },
    { label: 'Account',     icon: '👤', href: '/account' },
  ];

  return (
    <div className="lg:hidden" style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      background: 'rgba(26,22,18,0.98)',
      backdropFilter: 'blur(10px)',
      borderTop: '1px solid rgba(201,168,76,0.15)',
      display: 'flex',
      justifyContent: 'space-around',
      alignItems: 'center',
      height: '60px',
      zIndex: 100,
      paddingBottom: 'env(safe-area-inset-bottom)',
    }}>
      {navItems.map((item) => (
        <Link
          key={item.label}
          href={item.href}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.2rem',
            textDecoration: 'none',
            color: pathname === item.href ? 'var(--gold)' : 'var(--cream-50)',
            transition: 'color 0.2s',
          }}
        >
          <span style={{ fontSize: '1.2rem' }}>{item.icon}</span>
          <span style={{ fontSize: '0.55rem', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {item.label}
          </span>
        </Link>
      ))}
      <button
        onClick={openCart}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.2rem',
          background: 'none',
          border: 'none',
          color: 'var(--cream-50)',
          position: 'relative',
          cursor: 'pointer',
        }}
      >
        <span style={{ fontSize: '1.2rem' }}>🛒</span>
        <span style={{ fontSize: '0.55rem', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Cart
        </span>
        {itemCount > 0 && (
          <span style={{
            position: 'absolute',
            top: '-2px',
            right: '-4px',
            background: 'var(--gold)',
            color: 'var(--dark)',
            fontSize: '0.5rem',
            width: '14px',
            height: '14px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
          }}>
            {itemCount}
          </span>
        )}
      </button>
    </div>
  );
}
