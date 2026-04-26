'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useInfiniteQuery } from '@tanstack/react-query';
import { ProductCard } from '@/components/ui/ProductCard';
import { FilterPanel } from '@/components/ui/FilterPanel';
import { fetchProducts } from '@/lib/api/products';
import { ProductListItem } from '@/types/product';

interface CollectionClientProps {
  category: string;
  initialProducts: ProductListItem[];
  initialTotal: number;
}

export function CollectionClient({ category, initialProducts, initialTotal }: CollectionClientProps) {
  const searchParams  = useSearchParams();
  const sentinelRef   = useRef<HTMLDivElement>(null);
  const gridRef       = useRef<HTMLDivElement>(null);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Build query params from URL
  const getQuery = useCallback(() => ({
    category:    category !== 'all' ? (category as 'men' | 'women' | 'couples') : undefined,
    subCategory: (searchParams.get('subCategory') as 'tshirt' | undefined) || undefined,
    minPrice:    searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined,
    maxPrice:    searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined,
    inStock:     searchParams.get('inStock') === 'true' ? true : undefined,
    sort:        (searchParams.get('sort') as 'newest') || 'newest',
    limit:       12,
  }), [category, searchParams]);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery({
    queryKey:    ['products', category, searchParams.toString()],
    queryFn:     ({ pageParam = 1 }) => fetchProducts({ ...getQuery(), page: pageParam as number }),
    getNextPageParam: (last) =>
      last.pagination.hasNext ? last.pagination.page + 1 : undefined,
    initialPageParam: 1,
    initialData: {
      pages: [{
        status: 'ok',
        data: initialProducts,
        pagination: {
          page: 1, limit: 12, total: initialTotal,
          totalPages: Math.ceil(initialTotal / 12),
          hasNext: initialTotal > 12,
          hasPrev: false,
        },
      }],
      pageParams: [1],
    },
  });

  const allProducts = data?.pages.flatMap((p) => p.data) ?? [];

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { rootMargin: '200px' }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const displayCategory = category === 'all'
    ? 'All Collections'
    : category.charAt(0).toUpperCase() + category.slice(1);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--dark)', paddingTop: '5rem' }}>
      {/* ── Page header ── */}
      <div style={{
        padding: '3rem var(--section-px) 2rem',
        borderBottom: '1px solid rgba(201,168,76,0.08)',
      }}>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.6rem', letterSpacing: '0.2em', color: 'var(--gold)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
          Old Loom · Collections
        </p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 300, fontSize: 'clamp(2rem,5vw,4rem)', color: 'var(--cream)', lineHeight: 1, letterSpacing: '-0.02em' }}>
          {displayCategory}
        </h1>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.72rem', color: 'var(--cream-50)', marginTop: '0.5rem' }}>
          {data?.pages[0]?.pagination.total ?? initialTotal} pieces · hand-embroidered
        </p>

        {/* Mobile filter toggle */}
        <button
          id="mobile-filter-toggle"
          onClick={() => setMobileFilterOpen((o) => !o)}
          className="md:hidden"
          style={{
            marginTop: '1rem',
            background: 'rgba(201,168,76,0.1)',
            border: '1px solid rgba(201,168,76,0.3)',
            color: 'var(--gold)',
            padding: '0.5rem 1rem',
            borderRadius: 'var(--radius-sm)',
            fontFamily: 'var(--font-body)',
            fontSize: '0.65rem',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            cursor: 'none',
          }}
        >
          {mobileFilterOpen ? 'Close Filters' : 'Filters & Sort'}
        </button>
      </div>

      {/* ── Main layout ── */}
      <div style={{
        display: 'flex',
        gap: '3rem',
        padding: '2.5rem var(--section-px)',
        alignItems: 'flex-start',
      }}>
        {/* Sidebar — hidden on mobile unless open */}
        <div
          style={{
            display: mobileFilterOpen ? 'block' : undefined,
          }}
          className="hidden md:block"
        >
          <FilterPanel currentCategory={category} />
        </div>

        {/* Mobile sidebar overlay */}
        {mobileFilterOpen && (
          <div
            className="md:hidden"
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 300,
              background: 'rgba(26,22,18,0.97)',
              backdropFilter: 'blur(16px)',
              padding: '5rem 2rem 2rem',
              overflowY: 'auto',
            }}
          >
            <button
              onClick={() => setMobileFilterOpen(false)}
              style={{
                position: 'absolute', top: '1.5rem', right: '1.5rem',
                background: 'none', border: 'none', color: 'var(--cream)', cursor: 'none', fontSize: '1.2rem',
              }}
            >✕</button>
            <FilterPanel currentCategory={category} />
          </div>
        )}

        {/* Product grid */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {isLoading ? (
            <ProductSkeleton />
          ) : allProducts.length === 0 ? (
            <EmptyState />
          ) : (
            <>
              <div
                ref={gridRef}
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                  gap: '1.5rem',
                }}
              >
                {allProducts.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>

              {/* Infinite scroll sentinel */}
              <div ref={sentinelRef} style={{ height: '1px', marginTop: '2rem' }} />

              {isFetchingNextPage && (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
                  <LoadingSpinner />
                </div>
              )}

              {!hasNextPage && allProducts.length > 0 && (
                <p style={{
                  textAlign: 'center',
                  padding: '2rem',
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.65rem',
                  letterSpacing: '0.2em',
                  color: 'var(--cream-50)',
                  textTransform: 'uppercase',
                }}>
                  · All {allProducts.length} pieces shown ·
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function LoadingSpinner() {
  return (
    <div style={{
      width: '24px', height: '24px',
      border: '2px solid rgba(201,168,76,0.2)',
      borderTopColor: 'var(--gold)',
      borderRadius: '50%',
      animation: 'spin 0.8s linear infinite',
    }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function ProductSkeleton() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.5rem' }}>
      {Array.from({ length: 6 }).map((_, i) => (
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
  );
}

function EmptyState() {
  return (
    <div style={{ textAlign: 'center', padding: '5rem 2rem' }}>
      <p style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: 'var(--cream-50)', fontWeight: 300 }}>
        No pieces found
      </p>
      <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.7rem', color: 'rgba(245,240,232,0.3)', marginTop: '0.5rem', letterSpacing: '0.1em' }}>
        Try adjusting your filters
      </p>
    </div>
  );
}
