'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ProductCard } from '@/components/ui/ProductCard';
import { ProductListItem } from '@/types/product';

gsap.registerPlugin(ScrollTrigger);

export function FeaturedSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api/v1';
    fetch(`${apiUrl}/products/featured`)
      .then((r) => r.json())
      .then((data) => {
        if (data.data) setProducts(data.data);
      })
      .catch(() => {/* silently fail — show empty state */})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!sectionRef.current || products.length === 0) return;
    const cards = sectionRef.current.querySelectorAll('[data-featured-card]');
    const ctx = gsap.context(() => {
      gsap.from(cards, {
        y: 60,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 80%',
          toggleActions: 'play none none none',
        },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, [products]);

  if (!loading && products.length === 0) return null;

  return (
    <section
      ref={sectionRef}
      id="featured"
      style={{
        padding: 'var(--section-py) var(--section-px)',
        background: 'linear-gradient(180deg, var(--dark) 0%, #1f1611 100%)',
      }}
    >
      {/* Header */}
      <div style={{
        marginBottom: '3.5rem',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
      }}>
        <div>
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: '0.6rem',
            letterSpacing: '0.25em',
            color: 'var(--gold)',
            textTransform: 'uppercase',
            marginBottom: '0.75rem',
          }}>
            Bestsellers
          </p>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(2rem, 4vw, 4rem)',
            fontWeight: 200,
            color: 'var(--cream)',
            letterSpacing: '-0.02em',
          }}>
            Most <em style={{ color: 'var(--gold)', fontStyle: 'italic' }}>Loved</em>
          </h2>
        </div>
        <Link
          href="/collections/all"
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '0.65rem',
            color: 'var(--cream-50)',
            letterSpacing: '0.1em',
            textDecoration: 'none',
            borderBottom: '1px solid rgba(245,240,232,0.2)',
            paddingBottom: '2px',
            transition: 'color 0.2s ease, border-color 0.2s ease',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.color = 'var(--gold)';
            (e.currentTarget as HTMLElement).style.borderColor = 'var(--gold)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.color = 'var(--cream-50)';
            (e.currentTarget as HTMLElement).style.borderColor = 'rgba(245,240,232,0.2)';
          }}
        >
          View All →
        </Link>
      </div>

      {/* Product grid */}
      {loading ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: '1.5rem',
        }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} style={{
              borderRadius: 'var(--radius-md)',
              background: 'rgba(61,43,31,0.25)',
              border: '1px solid rgba(201,168,76,0.05)',
              overflow: 'hidden',
              animation: 'pulse 1.5s ease-in-out infinite',
            }}>
              <div style={{ aspectRatio: '3/4', background: 'rgba(201,168,76,0.06)' }} />
              <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ height: '10px', width: '40%', background: 'rgba(201,168,76,0.1)', borderRadius: '4px' }} />
                <div style={{ height: '16px', width: '80%', background: 'rgba(245,240,232,0.08)', borderRadius: '4px' }} />
                <div style={{ height: '12px', width: '30%', background: 'rgba(201,168,76,0.12)', borderRadius: '4px' }} />
              </div>
              <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.6} }`}</style>
            </div>
          ))}
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: '1.5rem',
        }}>
          {products.map((product) => (
            <div key={product._id} data-featured-card="">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
