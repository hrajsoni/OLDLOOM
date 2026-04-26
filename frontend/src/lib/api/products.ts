import {
  ProductListResponse,
  ProductDetailResponse,
  ProductCategory,
  ProductSubCategory,
} from '@/types/product';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api/v1';

export interface ProductQuery {
  category?: ProductCategory | 'all';
  subCategory?: ProductSubCategory;
  minPrice?: number;
  maxPrice?: number;
  tags?: string;
  inStock?: boolean;
  sort?: 'newest' | 'oldest' | 'popular' | 'price-asc' | 'price-desc';
  page?: number;
  limit?: number;
}

export async function fetchProducts(query: ProductQuery = {}): Promise<ProductListResponse> {
  const params = new URLSearchParams();

  if (query.category && query.category !== 'all') params.set('category', query.category);
  if (query.subCategory) params.set('subCategory', query.subCategory);
  if (query.minPrice != null) params.set('minPrice', String(query.minPrice));
  if (query.maxPrice != null) params.set('maxPrice', String(query.maxPrice));
  if (query.tags)    params.set('tags', query.tags);
  if (query.inStock) params.set('inStock', 'true');
  if (query.sort)    params.set('sort', query.sort);
  if (query.page)    params.set('page', String(query.page));
  if (query.limit)   params.set('limit', String(query.limit));

  const res = await fetch(`${API}/products?${params.toString()}`, {
    next: { revalidate: 60 },
  });

  if (!res.ok) throw new Error(`Failed to fetch products: ${res.statusText}`);
  return res.json();
}

export async function fetchProductBySlug(slug: string): Promise<ProductDetailResponse> {
  const res = await fetch(`${API}/products/${slug}`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) throw new Error(`Product not found: ${slug}`);
  return res.json();
}
