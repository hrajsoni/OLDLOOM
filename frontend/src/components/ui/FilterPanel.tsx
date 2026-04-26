'use client';

import { useCallback } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { ProductCategory, ProductSubCategory } from '@/types/product';

const SUBCATEGORIES: { label: string; value: ProductSubCategory }[] = [
  { label: 'T-Shirts',   value: 'tshirt'    },
  { label: 'Hoodies',    value: 'hoodie'    },
  { label: 'Caps',       value: 'cap'       },
  { label: 'Joggers',    value: 'jogger'    },
  { label: 'Trousers',   value: 'trouser'   },
  { label: 'Shorts',     value: 'short'     },
  { label: 'Coord Sets', value: 'coord-set' },
];

const SORT_OPTIONS = [
  { label: 'Newest',      value: 'newest'     },
  { label: 'Popular',     value: 'popular'    },
  { label: 'Price: Low',  value: 'price-asc'  },
  { label: 'Price: High', value: 'price-desc' },
];

const CATEGORY_TABS: { label: string; value: 'all' | ProductCategory }[] = [
  { label: 'All',     value: 'all'     },
  { label: 'Men',     value: 'men'     },
  { label: 'Women',   value: 'women'   },
  { label: 'Couples', value: 'couples' },
];

interface FilterPanelProps {
  currentCategory?: string;
}

export function FilterPanel({ currentCategory }: FilterPanelProps) {
  const router      = useRouter();
  const pathname    = usePathname();
  const searchParams = useSearchParams();

  const get  = (key: string) => searchParams.get(key) ?? '';
  const push = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([k, v]) => {
        if (v == null || v === '') params.delete(k);
        else params.set(k, v);
      });
      // Reset page when filters change
      if (!('page' in updates)) params.delete('page');
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  const activeCategory   = currentCategory ?? get('category') ?? 'all';
  const activeSubs       = get('subCategory') ? get('subCategory').split(',') : [];
  const activeSort       = get('sort') || 'newest';
  const minP             = get('minPrice') || '0';
  const maxP             = get('maxPrice') || '10000';
  const inStock          = get('inStock') === 'true';

  const toggleSubCat = (val: string) => {
    const next = activeSubs.includes(val)
      ? activeSubs.filter((s) => s !== val)
      : [...activeSubs, val];
    push({ subCategory: next.join(',') || null });
  };

  return (
    <aside
      id="filter-panel"
      aria-label="Product filters"
      style={{
        position: 'sticky',
        top: '6rem',
        width: '260px',
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: '2rem',
      }}
    >
      {/* ── Category tabs ── */}
      <div>
        <FilterLabel>Category</FilterLabel>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem' }}>
          {CATEGORY_TABS.map((tab) => {
            const active = activeCategory === tab.value;
            return (
              <button
                key={tab.value}
                onClick={() => push({ category: tab.value === 'all' ? null : tab.value })}
                style={{
                  background: active ? 'rgba(201,168,76,0.12)' : 'transparent',
                  border: 'none',
                  borderRadius: 'var(--radius-sm)',
                  color: active ? 'var(--gold)' : 'var(--cream-50)',
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.7rem',
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  padding: '0.6rem 0.8rem',
                  cursor: 'none',
                  textAlign: 'left',
                  transition: 'color 0.2s ease, background 0.2s ease',
                  borderLeft: active ? '2px solid var(--gold)' : '2px solid transparent',
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Sub-category checkboxes ── */}
      <div>
        <FilterLabel>Type</FilterLabel>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {SUBCATEGORIES.map((sub) => {
            const checked = activeSubs.includes(sub.value);
            return (
              <label
                key={sub.value}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  cursor: 'none',
                  color: checked ? 'var(--cream)' : 'var(--cream-50)',
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.7rem',
                  letterSpacing: '0.1em',
                  transition: 'color 0.2s ease',
                }}
              >
                <span
                  style={{
                    width: '14px',
                    height: '14px',
                    borderRadius: '3px',
                    border: checked ? '1px solid var(--gold)' : '1px solid rgba(245,240,232,0.25)',
                    background: checked ? 'rgba(201,168,76,0.2)' : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    transition: 'all 0.2s ease',
                  }}
                  onClick={() => toggleSubCat(sub.value)}
                  role="checkbox"
                  aria-checked={checked}
                  tabIndex={0}
                  onKeyDown={(e) => e.key === ' ' && toggleSubCat(sub.value)}
                >
                  {checked && (
                    <svg width="8" height="8" viewBox="0 0 10 10" fill="none">
                      <path d="M1.5 5L4 7.5 8.5 2.5" stroke="var(--gold)" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  )}
                </span>
                {sub.label}
              </label>
            );
          })}
        </div>
      </div>

      {/* ── Price Range ── */}
      <div>
        <FilterLabel>Price Range</FilterLabel>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-body)', fontSize: '0.65rem', color: 'var(--gold)' }}>
            <span>₹{Number(minP).toLocaleString('en-IN')}</span>
            <span>₹{Number(maxP).toLocaleString('en-IN')}</span>
          </div>
          <input
            type="range"
            min={0}
            max={10000}
            step={100}
            value={maxP}
            onChange={(e) => push({ maxPrice: e.target.value })}
            aria-label="Maximum price filter"
            style={{ width: '100%', accentColor: 'var(--gold)', cursor: 'pointer' }}
          />
        </div>
      </div>

      {/* ── In Stock toggle ── */}
      <div>
        <FilterLabel>Availability</FilterLabel>
        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            cursor: 'none',
            color: inStock ? 'var(--cream)' : 'var(--cream-50)',
            fontFamily: 'var(--font-body)',
            fontSize: '0.7rem',
            letterSpacing: '0.1em',
          }}
        >
          <span
            role="checkbox"
            aria-checked={inStock}
            tabIndex={0}
            onClick={() => push({ inStock: inStock ? null : 'true' })}
            onKeyDown={(e) => e.key === ' ' && push({ inStock: inStock ? null : 'true' })}
            style={{
              width: '14px', height: '14px', borderRadius: '3px',
              border: inStock ? '1px solid var(--gold)' : '1px solid rgba(245,240,232,0.25)',
              background: inStock ? 'rgba(201,168,76,0.2)' : 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0, transition: 'all 0.2s ease',
            }}
          >
            {inStock && (
              <svg width="8" height="8" viewBox="0 0 10 10" fill="none">
                <path d="M1.5 5L4 7.5 8.5 2.5" stroke="var(--gold)" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            )}
          </span>
          In Stock Only
        </label>
      </div>

      {/* ── Sort ── */}
      <div>
        <FilterLabel>Sort By</FilterLabel>
        <select
          value={activeSort}
          onChange={(e) => push({ sort: e.target.value })}
          aria-label="Sort products"
          style={{
            width: '100%',
            background: 'rgba(61,43,31,0.5)',
            border: '1px solid rgba(201,168,76,0.2)',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--cream)',
            fontFamily: 'var(--font-body)',
            fontSize: '0.7rem',
            letterSpacing: '0.1em',
            padding: '0.6rem 0.8rem',
            cursor: 'pointer',
            outline: 'none',
          }}
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {/* ── Clear filters ── */}
      <button
        onClick={() => router.push(pathname, { scroll: false })}
        style={{
          background: 'transparent',
          border: '1px solid rgba(201,168,76,0.2)',
          borderRadius: 'var(--radius-sm)',
          color: 'var(--cream-50)',
          fontFamily: 'var(--font-body)',
          fontSize: '0.65rem',
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          padding: '0.6rem 0.8rem',
          cursor: 'none',
          transition: 'color 0.2s, border-color 0.2s',
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.color = 'var(--gold)';
          (e.currentTarget as HTMLElement).style.borderColor = 'var(--gold)';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.color = 'var(--cream-50)';
          (e.currentTarget as HTMLElement).style.borderColor = 'rgba(201,168,76,0.2)';
        }}
      >
        Clear All Filters
      </button>
    </aside>
  );
}

function FilterLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{
      fontFamily: 'var(--font-body)',
      fontSize: '0.6rem',
      letterSpacing: '0.2em',
      textTransform: 'uppercase',
      color: 'var(--gold)',
      marginBottom: '0.75rem',
    }}>
      {children}
    </p>
  );
}
