import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { ProductDetailClient } from '@/components/ProductDetailClient';
import { fetchProductBySlug } from '@/lib/api/products';

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const { data } = await fetchProductBySlug(slug);
    return {
      title: data.metaTitle ?? `${data.name} | Old Loom`,
      description: data.metaDescription ?? data.description.slice(0, 160),
      openGraph: {
        title: data.name,
        description: data.description.slice(0, 160),
        images: data.images[0] ? [{ url: data.images[0] }] : [],
      },
    };
  } catch {
    return { title: 'Product | Old Loom' };
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;

  let product;
  let related;
  try {
    const res = await fetchProductBySlug(slug);
    product  = res.data;
    related  = res.related;
  } catch {
    notFound();
  }

  return (
    <Suspense>
      <ProductDetailClient product={product} related={related} />
    </Suspense>
  );
}
