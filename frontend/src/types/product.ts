// Shared API types for products

export type ProductCategory = 'men' | 'women' | 'couples';
export type ProductSubCategory =
  | 'tshirt'
  | 'hoodie'
  | 'cap'
  | 'jogger'
  | 'trouser'
  | 'short'
  | 'coord-set';

export interface ProductVariant {
  size: 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL' | 'Free Size';
  color: string;
  colorHex: string;
  stock: number;
  sku: string;
}

export interface ProductListItem {
  _id: string;
  name: string;
  slug: string;
  price: number;
  comparePrice?: number;
  images: string[];
  variants: ProductVariant[];
  tags: string[];
  category: ProductCategory;
  subCategory: ProductSubCategory;
  isFeatured: boolean;
  totalSold: number;
  averageRating: number;
  reviewCount: number;
  createdAt: string;
}

export interface ProductDetail extends ProductListItem {
  description: string;
  glbModel?: string;
  embroideryPattern?: string;
  isPublished: boolean;
  metaTitle?: string;
  metaDescription?: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ProductListResponse {
  status: string;
  data: ProductListItem[];
  pagination: PaginationMeta;
}

export interface ProductDetailResponse {
  status: string;
  data: ProductDetail;
  related: ProductListItem[];
}
