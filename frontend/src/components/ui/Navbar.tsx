'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { gsap } from 'gsap';
import { useCartStore } from '@/store/cartStore';

export function Navbar() {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const navRef    = useRef<HTMLElement>(null);
  const itemCount = useCartStore((s) => s.itemCount());
  const openCart  = useCartStore((s) => s.openCart);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Animate menu open
  useEffect(() => {
    if (!navRef.current) return;
    const links = navRef.current.querySelectorAll('.nav-link');
    if (menuOpen) {
      gsap.from(links, { y: 20, opacity: 0, stagger: 0.07, duration: 0.4, ease: 'power3.out' });
    }
  }, [menuOpen]);

  const navLinks = [
    { label: 'Men',     href: '/collections/men'     },
    { label: 'Women',   href: '/collections/women'   },
    { label: 'Couples', href: '/collections/couples' },
    { label: 'About',   href: '/about'               },
  ];

  return (
    <>
      <header
        ref={navRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 500,
          padding: '1.25rem var(--section-px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          transition: 'background 0.5s ease, backdrop-filter 0.5s ease, padding 0.3s ease',
          background:     scrolled ? 'rgba(26,22,18,0.85)' : 'transparent',
          backdropFilter: scrolled ? 'blur(16px)'          : 'none',
          borderBottom:   scrolled ? '1px solid rgba(201,168,76,0.1)' : 'none',
        }}
      >
        {/* Logo */}
        <Link
          href="/"
          style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', textDecoration: 'none' }}
          aria-label="Old Loom Home"
        >
          <div style={{ position: 'relative', width: '40px', height: '40px' }}>
            <Image src="/logo.png" alt="Old Loom Logo" fill style={{ objectFit: 'contain' }} />
          </div>
          <div>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 300, color: 'var(--cream)', letterSpacing: '-0.01em' }}>
              OLD <em style={{ color: 'var(--gold)', fontStyle: 'italic' }}>Loom</em>
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav
          aria-label="Main navigation"
          style={{ display: 'flex', gap: '2.5rem' }}
          className="hidden md:flex"
        >
          {navLinks.map((l) => (
            <Link
              key={l.label}
              href={l.href}
              className="nav-link"
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '0.65rem',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: 'var(--cream-50)',
                textDecoration: 'none',
                transition: 'color 0.2s ease',
              }}
              onMouseEnter={(e) => ((e.target as HTMLElement).style.color = 'var(--gold)')}
              onMouseLeave={(e) => ((e.target as HTMLElement).style.color = 'var(--cream-50)')}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Right actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          {/* Account */}
          <button
            onClick={() => router.push('/account')}
            aria-label="Account"
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--cream)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0.25rem',
              cursor: 'pointer',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </button>

          {/* Cart */}
          <button
            id="cart-button"
            onClick={openCart}
            aria-label={`Cart (${itemCount} items)`}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'none',
              position: 'relative',
              padding: '0.25rem',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--cream)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
            {itemCount > 0 && (
              <span
                id="cart-count-badge"
                style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  background: 'var(--gold)',
                  color: 'var(--dark)',
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  fontSize: '0.55rem',
                  fontFamily: 'var(--font-body)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                }}
              >
                {itemCount}
              </span>
            )}
          </button>

          {/* Hamburger — mobile */}
          <button
            id="menu-toggle"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
            className="md:hidden"
            style={{ background: 'none', border: 'none', cursor: 'none', padding: '0.25rem' }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  style={{
                    display: 'block',
                    width: '22px',
                    height: '1.5px',
                    background: 'var(--cream)',
                    transition: 'transform 0.3s ease, opacity 0.3s ease',
                    transformOrigin: 'center',
                    transform: menuOpen
                      ? i === 0 ? 'rotate(45deg) translate(4px,4px)' : i === 2 ? 'rotate(-45deg) translate(4px,-4px)' : ''
                      : '',
                    opacity: menuOpen && i === 1 ? 0 : 1,
                  }}
                />
              ))}
            </div>
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      {menuOpen && (
        <div
          role="dialog"
          aria-label="Mobile navigation"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 499,
            background: 'rgba(26,22,18,0.97)',
            backdropFilter: 'blur(20px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '2.5rem',
          }}
        >
          {navLinks.map((l) => (
            <Link
              key={l.label}
              href={l.href}
              onClick={() => setMenuOpen(false)}
              className="nav-link"
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '2.5rem',
                fontWeight: 300,
                color: 'var(--cream)',
                letterSpacing: '-0.01em',
                textDecoration: 'none',
              }}
            >
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
