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
        type: 'website',
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
    product = res.data;
    related = res.related;
  } catch {
    notFound();
  }

  // JSON-LD structured data for SEO
  const totalStock = product!.variants.reduce((s: number, v: { stock: number }) => s + v.stock, 0);
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product!.name,
    description: product!.description,
    image: product!.images,
    brand: {
      '@type': 'Brand',
      name: 'Old Loom',
    },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'INR',
      price: product!.price,
      priceValidUntil: new Date(Date.now() + 30 * 86400 * 1000).toISOString().split('T')[0],
      availability: totalStock > 0
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      url: `${process.env.NEXTAUTH_URL ?? 'https://oldloom.in'}/products/${product!.slug}`,
      seller: { '@type': 'Organization', name: 'Old Loom' },
    },
    ...(product!.reviewCount > 0 && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: product!.averageRating,
        reviewCount: product!.reviewCount,
      },
    }),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Suspense>
        <ProductDetailClient product={product!} related={related ?? []} />
      </Suspense>
    </>
  );
}
