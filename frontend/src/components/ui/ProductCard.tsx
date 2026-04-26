'use client';

import { useRef, useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { gsap } from 'gsap';
import { useCartStore } from '@/store/cartStore';
import { ProductListItem } from '@/types/product';

interface ProductCardProps {
  product: ProductListItem;
}

export function ProductCard({ product }: ProductCardProps) {
  const cardRef        = useRef<HTMLDivElement>(null);
  const imgWrapRef     = useRef<HTMLDivElement>(null);
  const img2Ref        = useRef<HTMLDivElement>(null);
  const quickAddRef    = useRef<HTMLDivElement>(null);
  const badgeNewRef    = useRef<HTMLSpanElement>(null);
  const [hovered, setHovered] = useState(false);

  const addItem  = useCartStore((s) => s.addItem);
  const openCart = useCartStore((s) => s.openCart);

  // Magnetic tilt setup
  const qX = useRef<ReturnType<typeof gsap.quickTo> | null>(null);
  const qY = useRef<ReturnType<typeof gsap.quickTo> | null>(null);

  useEffect(() => {
    if (!cardRef.current) return;
    qX.current = gsap.quickTo(cardRef.current, 'rotateY', { duration: 0.4, ease: 'power3.out' });
    qY.current = gsap.quickTo(cardRef.current, 'rotateX', { duration: 0.4, ease: 'power3.out' });
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width  / 2;
    const cy = rect.top  + rect.height / 2;
    const dx = ((e.clientX - cx) / (rect.width  / 2)) * 8;
    const dy = ((e.clientY - cy) / (rect.height / 2)) * 8;
    qX.current?.(dx);
    qY.current?.(-dy);
  };

  const handleMouseEnter = () => {
    setHovered(true);
    if (!cardRef.current || !img2Ref.current || !quickAddRef.current) return;
    gsap.to(cardRef.current, { y: -8, boxShadow: '0 24px 60px rgba(201,168,76,0.18)', duration: 0.4, ease: 'power3.out' });
    gsap.to(img2Ref.current, { opacity: 1, duration: 0.5, ease: 'power2.out' });
    gsap.to(quickAddRef.current, { y: 0, opacity: 1, duration: 0.35, ease: 'power3.out' });
  };

  const handleMouseLeave = () => {
    setHovered(false);
    if (!cardRef.current || !img2Ref.current || !quickAddRef.current) return;
    gsap.to(cardRef.current, { y: 0, rotateX: 0, rotateY: 0, boxShadow: '0 4px 24px rgba(0,0,0,0.25)', duration: 0.5, ease: 'power3.out' });
    gsap.to(img2Ref.current, { opacity: 0, duration: 0.4, ease: 'power2.in' });
    gsap.to(quickAddRef.current, { y: 12, opacity: 0, duration: 0.3, ease: 'power3.in' });
  };

  // Derived state
  const isNew       = new Date(product.createdAt) > new Date(Date.now() - 14 * 86400 * 1000);
  const totalStock  = product.variants.reduce((s, v) => s + v.stock, 0);
  const isLowStock  = totalStock > 0 && totalStock <= 8;
  const firstVariant = product.variants[0];
  const discount    = product.comparePrice ? Math.round((1 - product.price / product.comparePrice) * 100) : 0;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!firstVariant) return;
    addItem({
      productId: product._id,
      name:     product.name,
      image:    product.images[0] ?? '',
      slug:     product.slug,
      size:     firstVariant.size,
      color:    firstVariant.color,
      colorHex: firstVariant.colorHex,
      sku:      firstVariant.sku,
      price:    product.price,
      quantity: 1,
    });
    // Particle burst from button to cart icon
    spawnParticles(e.currentTarget as HTMLElement);
    openCart();
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        position: 'relative',
        borderRadius: 'var(--radius-md)',
        background: 'rgba(61,43,31,0.35)',
        border: '1px solid rgba(201,168,76,0.1)',
        overflow: 'hidden',
        cursor: 'none',
        transformStyle: 'preserve-3d',
        boxShadow: '0 4px 24px rgba(0,0,0,0.25)',
        transition: 'border-color 0.3s ease',
        borderColor: hovered ? 'rgba(201,168,76,0.3)' : 'rgba(201,168,76,0.1)',
      }}
    >
      {/* Image area */}
      <Link href={`/products/${product.slug}`} style={{ display: 'block', position: 'relative' }}>
        <div
          ref={imgWrapRef}
          style={{ position: 'relative', aspectRatio: '3/4', overflow: 'hidden', background: '#2a1f17' }}
        >
          {/* Primary image */}
          <Image
            src={product.images[0] ?? '/placeholder-product.jpg'}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            style={{ objectFit: 'cover', transition: 'transform 0.6s ease' }}
            placeholder="blur"
            blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAFCAYAAABirU3bAAAAFklEQVQI12NgYGD4z8BQDwAEgAF/QualIQAAAABJRU5ErkJggg=="
          />
          {/* Secondary image (cross-fade) */}
          <div
            ref={img2Ref}
            style={{ position: 'absolute', inset: 0, opacity: 0, pointerEvents: 'none' }}
          >
            {product.images[1] && (
              <Image
                src={product.images[1]}
                alt={`${product.name} alternate`}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                style={{ objectFit: 'cover' }}
              />
            )}
          </div>
        </div>

        {/* Badges */}
        <div style={{ position: 'absolute', top: '0.75rem', left: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
          {isNew && (
            <span ref={badgeNewRef} className="badge badge-gold">New</span>
          )}
          {isLowStock && (
            <span className="badge badge-rust">Low Stock</span>
          )}
          {discount > 0 && (
            <span className="badge" style={{ background: 'rgba(181,69,27,0.15)', color: '#B5451B', border: '1px solid rgba(181,69,27,0.3)' }}>
              -{discount}%
            </span>
          )}
        </div>

        {/* Quick add — slides up from bottom */}
        <div
          ref={quickAddRef}
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: '0.75rem',
            opacity: 0,
            transform: 'translateY(12px)',
            pointerEvents: hovered ? 'auto' : 'none',
          }}
          onClick={handleQuickAdd}
        >
          <button
            id={`quick-add-${product.slug}`}
            aria-label={`Quick add ${product.name} to cart`}
            style={{
              width: '100%',
              padding: '0.7rem',
              background: 'rgba(26,22,18,0.85)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(201,168,76,0.4)',
              color: 'var(--gold)',
              fontFamily: 'var(--font-body)',
              fontSize: '0.6rem',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              cursor: 'none',
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
            Quick Add
          </button>
        </div>
      </Link>

      {/* Info */}
      <div style={{ padding: '0.9rem 1rem 1rem' }}>
        {/* Category label */}
        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: '0.55rem',
          letterSpacing: '0.18em',
          color: 'var(--gold)',
          textTransform: 'uppercase',
          marginBottom: '0.35rem',
        }}>
          {product.category} · {product.subCategory}
        </p>

        {/* Product name */}
        <Link href={`/products/${product.slug}`} style={{ textDecoration: 'none' }}>
          <h3 style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 400,
            fontSize: '1.1rem',
            color: 'var(--cream)',
            lineHeight: 1.2,
            marginBottom: '0.5rem',
            letterSpacing: '-0.01em',
          }}>
            {product.name}
          </h3>
        </Link>

        {/* Price row */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.9rem', color: 'var(--gold)', fontWeight: 500 }}>
            ₹{product.price.toLocaleString('en-IN')}
          </span>
          {product.comparePrice && (
            <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.72rem', color: 'rgba(245,240,232,0.35)', textDecoration: 'line-through' }}>
              ₹{product.comparePrice.toLocaleString('en-IN')}
            </span>
          )}
        </div>

        {/* Colour swatches */}
        {(() => {
          const uniqueColors = [...new Map(product.variants.map((v) => [v.colorHex, v])).values()];
          return (
            <div style={{ display: 'flex', gap: '0.35rem', marginTop: '0.6rem' }}>
              {uniqueColors.slice(0, 4).map((v) => (
                <span
                  key={v.colorHex}
                  title={v.color}
                  style={{
                    width: '14px',
                    height: '14px',
                    borderRadius: '50%',
                    background: v.colorHex,
                    border: '1px solid rgba(245,240,232,0.2)',
                    display: 'inline-block',
                  }}
                />
              ))}
              {uniqueColors.length > 4 && (
                <span style={{ fontSize: '0.55rem', color: 'var(--cream-50)', alignSelf: 'center' }}>
                  +{uniqueColors.length - 4}
                </span>
              )}
            </div>
          );
        })()}
      </div>
    </div>
  );
}

// ── Particle burst helper ─────────────────────────────────────────────────────
function spawnParticles(origin: HTMLElement) {
  const rect = origin.getBoundingClientRect();
  const ox = rect.left + rect.width  / 2;
  const oy = rect.top  + rect.height / 2;

  // Target: cart button in header
  const cartBtn = document.getElementById('cart-button');
  const tx = cartBtn ? cartBtn.getBoundingClientRect().left + 10 : window.innerWidth - 48;
  const ty = cartBtn ? cartBtn.getBoundingClientRect().top  + 10 : 24;

  for (let i = 0; i < 12; i++) {
    const dot = document.createElement('div');
    dot.style.cssText = `
      position:fixed;
      left:${ox}px; top:${oy}px;
      width:6px; height:6px;
      border-radius:50%;
      background:var(--gold);
      pointer-events:none;
      z-index:9999;
      transform:translate(-50%,-50%);
    `;
    document.body.appendChild(dot);

    const angle  = (i / 12) * Math.PI * 2;
    const spread = 30 + Math.random() * 30;
    const midX   = ox + Math.cos(angle) * spread;
    const midY   = oy + Math.sin(angle) * spread;

    gsap.timeline()
      .to(dot, { x: midX - ox, y: midY - oy, duration: 0.25, ease: 'power2.out' })
      .to(dot, {
        x: tx - ox,
        y: ty - oy,
        scale: 0,
        duration: 0.45,
        ease: 'power3.in',
        onComplete: () => dot.remove(),
      });
  }

  // Pop the badge
  const badge = document.getElementById('cart-count-badge');
  if (badge) {
    gsap.fromTo(badge, { scale: 1.8 }, { scale: 1, duration: 0.4, ease: 'elastic.out(1,0.5)' });
  }
}
