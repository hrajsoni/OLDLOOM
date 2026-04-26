import type { Metadata } from 'next';
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { CollectionClient } from '@/components/CollectionClient';
import { fetchProducts } from '@/lib/api/products';
import { ProductCategory } from '@/types/product';

const VALID_CATEGORIES: (ProductCategory | 'all')[] = ['all', 'men', 'women', 'couples'];

interface CollectionPageProps {
  params: Promise<{ category: string }>;
  searchParams: Promise<Record<string, string>>;
}

export async function generateMetadata({ params }: CollectionPageProps): Promise<Metadata> {
  const { category } = await params;
  const label = category === 'all' ? 'All Collections' : category.charAt(0).toUpperCase() + category.slice(1);
  return {
    title: `${label} | Old Loom`,
    description: `Shop Old Loom's ${label.toLowerCase()} embroidered clothing collection. Hand-crafted pieces from India.`,
  };
}

export default async function CollectionPage({ params, searchParams }: CollectionPageProps) {
  const { category } = await params;
  const sp = await searchParams;

  if (!VALID_CATEGORIES.includes(category as ProductCategory | 'all')) {
    notFound();
  }

  // Server-side initial data fetch
  let initialProducts: Awaited<ReturnType<typeof fetchProducts>>['data'] = [];
  let initialTotal = 0;

  try {
    const res = await fetchProducts({
      category: category !== 'all' ? (category as ProductCategory) : undefined,
      subCategory: sp.subCategory as 'tshirt' | undefined,
      minPrice: sp.minPrice ? Number(sp.minPrice) : undefined,
      maxPrice: sp.maxPrice ? Number(sp.maxPrice) : undefined,
      inStock: sp.inStock === 'true' ? true : undefined,
      sort: (sp.sort as 'newest') || 'newest',
      page: 1,
      limit: 12,
    });
    initialProducts = res.data;
    initialTotal    = res.pagination.total;
  } catch {
    // If backend is down, render empty state gracefully
    initialProducts = [];
    initialTotal    = 0;
  }

  return (
    <Suspense>
      <CollectionClient
        category={category}
        initialProducts={initialProducts}
        initialTotal={initialTotal}
      />
    </Suspense>
  );
}

export function generateStaticParams() {
  return VALID_CATEGORIES.map((c) => ({ category: c }));
}
