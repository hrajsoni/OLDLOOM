'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { gsap } from 'gsap';
import { useCartStore } from '@/store/cartStore';

export function CartDrawer() {
  const { items, isOpen, closeCart, updateQty, removeItem, total } = useCartStore();
  const drawerRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      gsap.to(overlayRef.current, { opacity: 1, duration: 0.3, display: 'block', ease: 'power2.out' });
      gsap.to(drawerRef.current, { x: '0%', duration: 0.5, ease: 'power3.out' });
      document.body.style.overflow = 'hidden';
    } else {
      gsap.to(drawerRef.current, { x: '100%', duration: 0.4, ease: 'power3.in' });
      gsap.to(overlayRef.current, { opacity: 0, duration: 0.3, display: 'none', ease: 'power2.in' });
      document.body.style.overflow = '';
    }
  }, [isOpen]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) closeCart();
  };

  return (
    <>
      <div
        ref={overlayRef}
        onClick={handleOverlayClick}
        style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(26,22,18,0.7)', backdropFilter: 'blur(4px)',
          display: 'none', opacity: 0,
        }}
      />
      <div
        ref={drawerRef}
        style={{
          position: 'fixed', top: 0, right: 0, bottom: 0, zIndex: 1001,
          width: '100%', maxWidth: '440px',
          background: 'var(--dark)', borderLeft: '1px solid rgba(201,168,76,0.15)',
          transform: 'translateX(100%)', display: 'flex', flexDirection: 'column',
          boxShadow: '-10px 0 30px rgba(0,0,0,0.5)',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          borderBottom: '1px solid rgba(201,168,76,0.1)'
        }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: 'var(--cream)', fontWeight: 300 }}>
            Your Cart
          </h2>
          <button onClick={closeCart} style={{
            background: 'none', border: 'none', color: 'var(--cream-50)', fontSize: '1.5rem', cursor: 'pointer', padding: '0.25rem 0.5rem'
          }}>
            ✕
          </button>
        </div>

        {/* Free Shipping Progress */}
        {(() => {
          const FREE_THRESHOLD = 5000;
          const totalVal = items.reduce((s, i) => s + i.price * i.quantity, 0);
          const remaining = Math.max(0, FREE_THRESHOLD - totalVal);
          const pct = Math.min(100, (totalVal / FREE_THRESHOLD) * 100);
          return (
            <div style={{ padding: '0.75rem 2rem', background: 'rgba(201,168,76,0.05)', borderBottom: '1px solid rgba(201,168,76,0.08)' }}>
              {remaining > 0 ? (
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--cream-50)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.4rem' }}>
                  Add <span style={{ color: 'var(--gold)' }}>₹{remaining.toLocaleString('en-IN')}</span> more for free shipping
                </p>
              ) : (
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: '#34A853', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.4rem' }}>🎉 You qualify for free shipping!</p>
              )}
              <div style={{ height: '3px', background: 'rgba(201,168,76,0.15)', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${pct}%`, background: 'var(--gold)', borderRadius: '2px', transition: 'width 0.4s ease' }} />
              </div>
            </div>
          );
        })()}

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {items.length === 0 ? (
            <div style={{ margin: 'auto', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1" style={{ marginBottom: '1rem', opacity: 0.5 }}>
                <path d="M4 4h16v16H4z M4 9h16 M9 4v16" strokeDasharray="100" strokeDashoffset="0" className="needle-animation" />
              </svg>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.8rem', color: 'var(--cream-50)' }}>Your cart is empty.</p>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.sku} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div style={{ width: '80px', height: '100px', position: 'relative', borderRadius: 'var(--radius-sm)', overflow: 'hidden', background: 'rgba(201,168,76,0.05)' }}>
                  <Image src={item.image || '/placeholder.jpg'} alt={item.name} fill style={{ objectFit: 'cover' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: 'var(--cream)' }}>{item.name}</h3>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.65rem', color: 'var(--cream-50)', margin: '0.2rem 0' }}>
                    {item.color} / {item.size}
                  </p>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.8rem', color: 'var(--gold)', marginTop: '0.5rem' }}>
                    ₹{item.price.toLocaleString('en-IN')}
                  </p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                  <button onClick={() => removeItem(item.sku)} style={{ background: 'none', border: 'none', color: 'var(--rust)', fontSize: '0.7rem', cursor: 'pointer' }}>Remove</button>
                  <div style={{ display: 'flex', border: '1px solid rgba(201,168,76,0.2)', borderRadius: '4px' }}>
                    <button onClick={() => updateQty(item.sku, item.quantity - 1)} style={{ padding: '0.2rem 0.6rem', background: 'none', border: 'none', color: 'var(--cream)', cursor: 'pointer', fontSize: '1rem' }}>−</button>
                    <span style={{ padding: '0.2rem 0.5rem', color: 'var(--cream)', fontSize: '0.8rem', minWidth: '30px', textAlign: 'center' }}>{item.quantity}</span>
                    <button onClick={() => updateQty(item.sku, item.quantity + 1)} style={{ padding: '0.2rem 0.6rem', background: 'none', border: 'none', color: 'var(--cream)', cursor: 'pointer', fontSize: '1rem' }}>+</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div style={{ padding: '2rem', borderTop: '1px solid rgba(201,168,76,0.1)', background: 'rgba(26,22,18,0.95)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', fontFamily: 'var(--font-body)', color: 'var(--cream)' }}>
              <span style={{ letterSpacing: '0.1em' }}>SUBTOTAL</span>
              <span style={{ fontSize: '1.2rem', color: 'var(--gold)' }}>₹{total().toLocaleString('en-IN')}</span>
            </div>
            <Link href="/checkout" onClick={closeCart} style={{
              display: 'block', textAlign: 'center', width: '100%', padding: '1rem',
              background: 'var(--gold)', color: 'var(--dark)', fontFamily: 'var(--font-body)',
              textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '0.15em', fontSize: '0.8rem',
              fontWeight: 500, borderRadius: 'var(--radius-sm)'
            }}>
              Proceed to Checkout
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
