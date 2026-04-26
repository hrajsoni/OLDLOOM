'use client';

import { useRef, useState, useEffect, Suspense } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import * as THREE from 'three';
import { toast } from 'react-hot-toast';
import { useCartStore } from '@/store/cartStore';
import { ProductDetail, ProductListItem, ProductVariant } from '@/types/product';
import { ProductCard } from '@/components/ui/ProductCard';

gsap.registerPlugin(ScrollTrigger);

const Scene                  = dynamic(() => import('@/components/3d/Scene').then((m) => ({ default: m.Scene })), { ssr: false });
const ProductViewerContent   = dynamic(() => import('@/components/3d/ProductViewerContent').then((m) => ({ default: m.ProductViewerContent })), { ssr: false });

interface ProductDetailClientProps {
  product: ProductDetail;
  related: ProductListItem[];
}

export function ProductDetailClient({ product, related }: ProductDetailClientProps) {
  const addItem  = useCartStore((s) => s.addItem);
  const openCart = useCartStore((s) => s.openCart);

  // Unique colors
  const uniqueColors = [...new Map(product.variants.map((v) => [v.colorHex, v])).values()];
  const uniqueSizes  = [...new Set(product.variants.map((v) => v.size))];

  const [selectedColor, setSelectedColor] = useState<ProductVariant>(uniqueColors[0] ?? product.variants[0]);
  const [selectedSize, setSelectedSize]   = useState<string>(uniqueSizes[0] ?? 'M');
  const [qty, setQty]                     = useState(1);
  const [wishlisted, setWishlisted]       = useState(false);

  // 3D material ref — allows colour swap without remounting canvas
  const materialRef = useRef<THREE.MeshStandardMaterial | null>(null);

  // Refs for GSAP animations
  const craftSectionRef    = useRef<HTMLDivElement>(null);
  const svgPathRef         = useRef<SVGPathElement>(null);
  const addToCartBtnRef    = useRef<HTMLButtonElement>(null);
  const relatedRowRef      = useRef<HTMLDivElement>(null);

  // ── Embroidery SVG stroke animation on scroll ─────────────────────────────
  useEffect(() => {
    const path = svgPathRef.current;
    if (!path) return;

    const length = path.getTotalLength();
    gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });

    const trigger = ScrollTrigger.create({
      trigger: craftSectionRef.current,
      start: 'top 80%',
      end: 'bottom 60%',
      scrub: 1.5,
      onUpdate: (self) => {
        gsap.set(path, { strokeDashoffset: length * (1 - self.progress) });
      },
    });
    return () => trigger.kill();
  }, []);

  // ── Related row stagger reveal ────────────────────────────────────────────
  useEffect(() => {
    if (!relatedRowRef.current) return;
    const cards = relatedRowRef.current.querySelectorAll('[data-related-card]');
    gsap.from(cards, {
      scrollTrigger: { trigger: relatedRowRef.current, start: 'top 85%' },
      y: 40, opacity: 0, duration: 0.7, stagger: 0.1, ease: 'power3.out',
    });
  }, [related]);

  // ── Derived ───────────────────────────────────────────────────────────────
  const getVariant = () =>
    product.variants.find((v) => v.colorHex === selectedColor.colorHex && v.size === selectedSize);

  const currentVariant = getVariant();
  const inStock = (currentVariant?.stock ?? 0) > 0;

  const handleAddToCart = () => {
    if (!currentVariant) {
      toast.error('Please select size and colour');
      return;
    }
    if (!inStock) {
      toast.error('This variant is out of stock');
      return;
    }
    addItem({
      productId: product._id,
      name:     product.name,
      image:    product.images[0] ?? '',
      slug:     product.slug,
      size:     selectedSize,
      color:    selectedColor.color,
      colorHex: selectedColor.colorHex,
      sku:      currentVariant.sku,
      price:    product.price,
      quantity: qty,
    });

    // Particle burst
    if (addToCartBtnRef.current) spawnParticles(addToCartBtnRef.current);
    toast.success(`Added to cart · ${product.name}`);
    openCart();
  };

  const discount = product.comparePrice
    ? Math.round((1 - product.price / product.comparePrice) * 100)
    : 0;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--dark)', paddingTop: '5rem' }}>

      {/* ── BREADCRUMB ── */}
      <nav aria-label="Breadcrumb" style={{ padding: '1.5rem var(--section-px)', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        {[
          { label: 'Home', href: '/' },
          { label: 'Collections', href: `/collections/${product.category}` },
          { label: product.name, href: '#' },
        ].map((crumb, i, arr) => (
          <span key={crumb.href} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {i < arr.length - 1 ? (
              <>
                <Link href={crumb.href} style={{ fontFamily: 'var(--font-body)', fontSize: '0.6rem', letterSpacing: '0.15em', color: 'var(--cream-50)', textTransform: 'uppercase', textDecoration: 'none' }}>
                  {crumb.label}
                </Link>
                <span style={{ color: 'rgba(245,240,232,0.2)', fontSize: '0.6rem' }}>›</span>
              </>
            ) : (
              <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.6rem', letterSpacing: '0.15em', color: 'var(--gold)', textTransform: 'uppercase' }}>
                {crumb.label}
              </span>
            )}
          </span>
        ))}
      </nav>

      {/* ── MAIN: Viewer + Info ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
        gap: '3rem',
        padding: '0 var(--section-px) 4rem',
        alignItems: 'start',
      }}>
        {/* ── LEFT: 3D Viewer ── */}
        <div style={{ position: 'sticky', top: '6rem' }}>
          <div style={{
            aspectRatio: '1',
            borderRadius: 'var(--radius-lg)',
            background: 'rgba(61,43,31,0.35)',
            border: '1px solid rgba(201,168,76,0.12)',
            overflow: 'hidden',
          }}>
            <Suspense fallback={
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.65rem', color: 'var(--gold)', letterSpacing: '0.2em' }}>LOADING 3D…</p>
              </div>
            }>
              <Scene camera={{ position: [0, 0, 4], fov: 40 }} style={{ width: '100%', height: '100%' }}>
                <ProductViewerContent
                  colorHex={selectedColor.colorHex}
                  materialRef={materialRef}
                />
              </Scene>
            </Suspense>
          </div>
          <p style={{ textAlign: 'center', fontFamily: 'var(--font-body)', fontSize: '0.55rem', color: 'rgba(245,240,232,0.3)', marginTop: '0.75rem', letterSpacing: '0.15em' }}>
            Drag to rotate · Scroll to zoom
          </p>
        </div>

        {/* ── RIGHT: Product Info ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          {/* Category label */}
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.6rem', letterSpacing: '0.2em', color: 'var(--gold)', textTransform: 'uppercase' }}>
            {product.category} · {product.subCategory}
          </p>

          {/* Name */}
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 300, fontSize: 'clamp(2rem,4vw,3rem)', color: 'var(--cream)', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
            {product.name}
          </h1>

          {/* Rating row */}
          {product.reviewCount > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ color: 'var(--gold)', fontSize: '0.9rem' }}>{'★'.repeat(Math.round(product.averageRating))}</span>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.65rem', color: 'var(--cream-50)' }}>
                {product.averageRating.toFixed(1)} ({product.reviewCount} reviews)
              </span>
            </div>
          )}

          {/* Price */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: 'var(--gold)', fontWeight: 400 }}>
              ₹{product.price.toLocaleString('en-IN')}
            </span>
            {product.comparePrice && (
              <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: 'rgba(245,240,232,0.35)', textDecoration: 'line-through' }}>
                ₹{product.comparePrice.toLocaleString('en-IN')}
              </span>
            )}
            {discount > 0 && (
              <span className="badge badge-rust">-{discount}%</span>
            )}
          </div>

          <div className="divider" />

          {/* Description */}
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.78rem', lineHeight: 1.8, color: 'var(--cream-50)' }}>
            {product.description}
          </p>

          <div className="divider" />

          {/* Colour swatches */}
          <div>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.6rem', letterSpacing: '0.2em', color: 'var(--cream-50)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
              Colour — <span style={{ color: 'var(--cream)' }}>{selectedColor.color}</span>
            </p>
            <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
              {uniqueColors.map((v) => (
                <button
                  key={v.colorHex}
                  title={v.color}
                  onClick={() => setSelectedColor(v)}
                  aria-label={`Select colour ${v.color}`}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: v.colorHex,
                    border: selectedColor.colorHex === v.colorHex
                      ? '2px solid var(--gold)'
                      : '2px solid rgba(245,240,232,0.15)',
                    cursor: 'none',
                    transition: 'border-color 0.2s ease, transform 0.2s ease',
                    transform: selectedColor.colorHex === v.colorHex ? 'scale(1.15)' : 'scale(1)',
                    outline: 'none',
                    boxShadow: selectedColor.colorHex === v.colorHex ? '0 0 0 3px rgba(201,168,76,0.25)' : 'none',
                  }}
                />
              ))}
            </div>
          </div>

          {/* Size selector */}
          <div>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.6rem', letterSpacing: '0.2em', color: 'var(--cream-50)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
              Size — <span style={{ color: 'var(--cream)' }}>{selectedSize}</span>
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {uniqueSizes.map((size) => {
                const v = product.variants.find((vv) => vv.size === size && vv.colorHex === selectedColor.colorHex);
                const available = (v?.stock ?? 0) > 0;
                return (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    disabled={!available}
                    aria-label={`Size ${size}${!available ? ' — out of stock' : ''}`}
                    style={{
                      minWidth: '44px',
                      padding: '0.5rem 0.75rem',
                      borderRadius: 'var(--radius-sm)',
                      border: selectedSize === size ? '1px solid var(--gold)' : '1px solid rgba(245,240,232,0.15)',
                      background: selectedSize === size ? 'rgba(201,168,76,0.15)' : 'transparent',
                      color: !available ? 'rgba(245,240,232,0.2)' : selectedSize === size ? 'var(--gold)' : 'var(--cream-50)',
                      fontFamily: 'var(--font-body)',
                      fontSize: '0.7rem',
                      letterSpacing: '0.1em',
                      cursor: available ? 'none' : 'not-allowed',
                      transition: 'all 0.2s ease',
                      textDecoration: !available ? 'line-through' : 'none',
                    }}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quantity stepper */}
          <div>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.6rem', letterSpacing: '0.2em', color: 'var(--cream-50)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
              Quantity
            </p>
            <div style={{ display: 'inline-flex', alignItems: 'center', border: '1px solid rgba(201,168,76,0.2)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
              {[{ label: '−', action: () => setQty((q) => Math.max(1, q - 1)) }, { label: String(qty), action: null }, { label: '+', action: () => setQty((q) => Math.min(currentVariant?.stock ?? 10, q + 1)) }].map((item, i) => (
                <span
                  key={i}
                  onClick={item.action ?? undefined}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    width: '40px', height: '40px',
                    fontFamily: 'var(--font-body)', fontSize: '0.8rem', color: i === 1 ? 'var(--cream)' : 'var(--gold)',
                    background: i === 1 ? 'rgba(61,43,31,0.4)' : 'transparent',
                    cursor: item.action ? 'none' : 'default',
                    transition: 'background 0.2s',
                    userSelect: 'none',
                  }}
                >
                  {item.label}
                </span>
              ))}
            </div>
          </div>

          {/* Add to Cart + Wishlist */}
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button
              ref={addToCartBtnRef}
              id={`add-to-cart-${product.slug}`}
              onClick={handleAddToCart}
              disabled={!inStock}
              style={{
                flex: 1,
                minWidth: '200px',
                padding: '1rem 2rem',
                background: inStock ? 'var(--gold)' : 'rgba(201,168,76,0.15)',
                color: inStock ? 'var(--dark)' : 'var(--gold)',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                fontFamily: 'var(--font-body)',
                fontSize: '0.72rem',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                cursor: inStock ? 'none' : 'not-allowed',
                transition: 'background 0.3s ease, transform 0.2s ease',
                fontWeight: 500,
              }}
              onMouseEnter={(e) => inStock && ((e.currentTarget as HTMLElement).style.background = '#d4b355')}
              onMouseLeave={(e) => inStock && ((e.currentTarget as HTMLElement).style.background = 'var(--gold)')}
            >
              {inStock ? 'Add to Cart ↗' : 'Out of Stock'}
            </button>

            <button
              id={`wishlist-${product.slug}`}
              onClick={() => { setWishlisted((w) => !w); toast(wishlisted ? 'Removed from wishlist' : 'Added to wishlist ♡'); }}
              aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
              style={{
                padding: '1rem',
                background: wishlisted ? 'rgba(181,69,27,0.15)' : 'rgba(61,43,31,0.4)',
                border: wishlisted ? '1px solid rgba(181,69,27,0.4)' : '1px solid rgba(201,168,76,0.2)',
                borderRadius: 'var(--radius-sm)',
                color: wishlisted ? 'var(--rust)' : 'var(--cream-50)',
                cursor: 'none',
                transition: 'all 0.25s ease',
                fontSize: '1.1rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              {wishlisted ? '♥' : '♡'}
            </button>
          </div>

          {/* Stock warning */}
          {currentVariant && currentVariant.stock > 0 && currentVariant.stock <= 5 && (
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.65rem', color: 'var(--rust)', letterSpacing: '0.1em' }}>
              Only {currentVariant.stock} left in stock — order soon
            </p>
          )}

          {/* Tags */}
          {product.tags.length > 0 && (
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              {product.tags.map((tag) => (
                <span key={tag} className="badge badge-gold">{tag}</span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── EMBROIDERY CRAFT SECTION ── */}
      <div
        ref={craftSectionRef}
        style={{
          padding: 'var(--section-py) var(--section-px)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '4rem',
          alignItems: 'center',
          borderTop: '1px solid rgba(201,168,76,0.08)',
          borderBottom: '1px solid rgba(201,168,76,0.08)',
        }}
      >
        {/* Image */}
        {product.images[0] && (
          <div style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', aspectRatio: '1', position: 'relative' }}>
            <Image
              src={product.images[0]}
              alt={`${product.name} embroidery detail`}
              fill
              style={{ objectFit: 'cover' }}
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        )}

        {/* SVG embroidery pattern */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.6rem', letterSpacing: '0.2em', color: 'var(--gold)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
              Craft Detail
            </p>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 300, fontSize: 'clamp(1.75rem,3vw,2.5rem)', color: 'var(--cream)', lineHeight: 1.1 }}>
              The Art of Embroidery
            </h2>
          </div>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.78rem', lineHeight: 1.8, color: 'var(--cream-50)' }}>
            Each piece is individually hand-embroidered by artisans in Lucknow and Bhopal. The intricate thread-work takes 6–14 hours per garment, preserving centuries-old techniques in a contemporary silhouette.
          </p>

          {/* Animated SVG pattern */}
          <svg viewBox="0 0 320 200" fill="none" style={{ maxWidth: '320px', opacity: 0.7 }} aria-hidden="true">
            <path
              ref={svgPathRef}
              d="M20 100 Q50 40 80 100 Q110 160 140 100 Q170 40 200 100 Q230 160 260 100 Q290 40 310 70
                 M20 130 Q60 80 100 130 Q140 180 180 130 Q220 80 260 130 Q280 150 310 120
                 M40 70 Q80 30 120 70 Q160 110 200 70 Q240 30 280 70
                 M30 160 Q70 120 110 160 Q150 200 190 160 Q230 120 270 160"
              stroke="var(--gold)"
              strokeWidth="1.5"
              strokeLinecap="round"
              style={{ fill: 'none' }}
            />
          </svg>
        </div>
      </div>

      {/* ── RELATED PRODUCTS ── */}
      {related.length > 0 && (
        <div style={{ padding: 'var(--section-py) var(--section-px)' }}>
          <div style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.6rem', letterSpacing: '0.2em', color: 'var(--gold)', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                You May Also Like
              </p>
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 300, fontSize: 'clamp(1.5rem,3vw,2.5rem)', color: 'var(--cream)', lineHeight: 1.1 }}>
                Related Pieces
              </h2>
            </div>
            <Link
              href={`/collections/${product.category}`}
              style={{ fontFamily: 'var(--font-body)', fontSize: '0.65rem', letterSpacing: '0.15em', color: 'var(--gold)', textTransform: 'uppercase', textDecoration: 'none' }}
            >
              View All →
            </Link>
          </div>

          {/* Horizontal scroll row */}
          <div
            ref={relatedRowRef}
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
              gap: '1.25rem',
            }}
          >
            {related.map((p) => (
              <div key={p._id} data-related-card="">
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Particle burst ─────────────────────────────────────────────────────────────
function spawnParticles(origin: HTMLElement) {
  const rect = origin.getBoundingClientRect();
  const ox = rect.left + rect.width  / 2;
  const oy = rect.top  + rect.height / 2;
  const cartBtn = document.getElementById('cart-button');
  const tx = cartBtn ? cartBtn.getBoundingClientRect().left + 10 : window.innerWidth - 48;
  const ty = cartBtn ? cartBtn.getBoundingClientRect().top  + 10 : 24;

  for (let i = 0; i < 12; i++) {
    const dot = document.createElement('div');
    dot.style.cssText = `position:fixed;left:${ox}px;top:${oy}px;width:6px;height:6px;border-radius:50%;background:var(--gold);pointer-events:none;z-index:9999;transform:translate(-50%,-50%);`;
    document.body.appendChild(dot);

    const angle  = (i / 12) * Math.PI * 2;
    const spread = 30 + Math.random() * 30;
    const midX   = ox + Math.cos(angle) * spread;
    const midY   = oy + Math.sin(angle) * spread;

    gsap.timeline()
      .to(dot, { x: midX - ox, y: midY - oy, duration: 0.25, ease: 'power2.out' })
      .to(dot, { x: tx - ox, y: ty - oy, scale: 0, duration: 0.45, ease: 'power3.in', onComplete: () => dot.remove() });
  }
  const badge = document.getElementById('cart-count-badge');
  if (badge) gsap.fromTo(badge, { scale: 1.8 }, { scale: 1, duration: 0.4, ease: 'elastic.out(1,0.5)' });
}
