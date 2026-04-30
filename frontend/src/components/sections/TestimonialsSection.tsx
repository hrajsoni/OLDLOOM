'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const TESTIMONIALS = [
  {
    id: 1,
    name: 'Aanya Sharma',
    location: 'Mumbai',
    rating: 5,
    text: 'The embroidery on my Twin Thread set is absolutely breathtaking. You can feel the hours of craftsmanship in every stitch. Wore it to our anniversary dinner — got so many compliments.',
    product: 'Twin Thread Coord Set',
    avatar: 'AS',
  },
  {
    id: 2,
    name: 'Rohan Mehta',
    location: 'Delhi',
    rating: 5,
    text: 'Bought the Heritage Weave Classic Tee and I\'m obsessed. The quality is unlike anything I\'ve found at this price point. The embroidery doesn\'t fade even after multiple washes.',
    product: 'Heritage Weave Classic Tee',
    avatar: 'RM',
  },
  {
    id: 3,
    name: 'Priya Kapoor',
    location: 'Bangalore',
    rating: 5,
    text: 'The Silk Thread Embroidered Tee is so elegant. I love how the shimmer changes in different lighting. Finally a brand that understands Indian craftsmanship without being overdressed.',
    product: 'Silk Thread Embroidered Tee',
    avatar: 'PK',
  },
  {
    id: 4,
    name: 'Karan Singh',
    location: 'Jaipur',
    rating: 5,
    text: 'The Embroidered Luxe Hoodie is my go-to for winter. Heavy, warm, and the embroidery on the back is a showstopper. Fast shipping too — arrived in 3 days.',
    product: 'Embroidered Luxe Hoodie',
    avatar: 'KS',
  },
  {
    id: 5,
    name: 'Sneha Patel',
    location: 'Ahmedabad',
    rating: 5,
    text: 'I gifted the Mirror Weave Couple Hoodie to my partner and we absolutely love them. The matching embroidery patterns that complete each other is such a beautiful concept.',
    product: 'Mirror Weave Couple Hoodie',
    avatar: 'SP',
  },
];

export function TestimonialsSection() {
  const sectionRef  = useRef<HTMLElement>(null);
  const trackRef    = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (!sectionRef.current) return;
    const header = sectionRef.current.querySelector('[data-testimonials-header]');
    const ctx = gsap.context(() => {
      gsap.from(header, {
        y: 40,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 80%', toggleActions: 'play none none none' },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  // Auto-advance
  useEffect(() => {
    const id = setInterval(() => setActive((a) => (a + 1) % TESTIMONIALS.length), 5000);
    return () => clearInterval(id);
  }, []);

  const t = TESTIMONIALS[active];

  return (
    <section
      ref={sectionRef}
      id="testimonials"
      style={{
        padding: 'var(--section-py) var(--section-px)',
        background: 'var(--dark)',
        overflow: 'hidden',
      }}
    >
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        {/* Header */}
        <div data-testimonials-header="" style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: '0.6rem',
            letterSpacing: '0.25em',
            color: 'var(--gold)',
            textTransform: 'uppercase',
            marginBottom: '0.75rem',
          }}>
            What They Say
          </p>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(2rem, 4vw, 3.5rem)',
            fontWeight: 200,
            color: 'var(--cream)',
            letterSpacing: '-0.02em',
          }}>
            Worn with <em style={{ color: 'var(--gold)', fontStyle: 'italic' }}>Love</em>
          </h2>
        </div>

        {/* Active testimonial */}
        <div
          key={active}
          style={{
            background: 'rgba(61,43,31,0.35)',
            border: '1px solid rgba(201,168,76,0.12)',
            borderRadius: 'var(--radius-lg)',
            padding: 'clamp(2rem, 5vw, 3.5rem)',
            position: 'relative',
            animation: 'fadeInUp 0.5s ease forwards',
          }}
        >
          <style>{`
            @keyframes fadeInUp {
              from { opacity: 0; transform: translateY(20px); }
              to   { opacity: 1; transform: translateY(0); }
            }
          `}</style>

          {/* Quote mark */}
          <span style={{
            position: 'absolute',
            top: '1.5rem',
            left: '2rem',
            fontFamily: 'var(--font-display)',
            fontSize: '5rem',
            color: 'var(--gold)',
            opacity: 0.12,
            lineHeight: 1,
            userSelect: 'none',
          }}>
            "
          </span>

          {/* Stars */}
          <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '1.5rem' }}>
            {Array.from({ length: t.rating }).map((_, i) => (
              <span key={i} style={{ color: 'var(--gold)', fontSize: '1rem' }}>★</span>
            ))}
          </div>

          {/* Review text */}
          <p style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(1.1rem, 2.5vw, 1.4rem)',
            color: 'var(--cream)',
            lineHeight: 1.6,
            fontStyle: 'italic',
            fontWeight: 300,
            marginBottom: '2rem',
          }}>
            "{t.text}"
          </p>

          {/* Author + product */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              background: 'rgba(201,168,76,0.15)',
              border: '1px solid rgba(201,168,76,0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'var(--font-body)',
              fontSize: '0.65rem',
              color: 'var(--gold)',
              flexShrink: 0,
            }}>
              {t.avatar}
            </div>
            <div>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.8rem', color: 'var(--cream)', fontWeight: 500 }}>
                {t.name}
              </p>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.65rem', color: 'var(--cream-50)' }}>
                {t.location} · Purchased: {t.product}
              </p>
            </div>
          </div>
        </div>

        {/* Dots navigation */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '2rem' }}>
          {TESTIMONIALS.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              aria-label={`Testimonial ${i + 1}`}
              style={{
                width: i === active ? '24px' : '8px',
                height: '8px',
                borderRadius: '4px',
                background: i === active ? 'var(--gold)' : 'rgba(201,168,76,0.25)',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                padding: 0,
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
