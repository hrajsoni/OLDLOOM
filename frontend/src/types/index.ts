// ── Shared Types for Old Loom ──────────────────────────────────────────────────

export type UserRole =
  | 'customer'
  | 'support_staff'
  | 'content_editor'
  | 'manager'
  | 'super_admin';

export type ProductCategory = 'men' | 'women' | 'couples';
export type ProductSubCategory =
  | 'tshirt'
  | 'hoodie'
  | 'cap'
  | 'jogger'
  | 'trouser'
  | 'short'
  | 'coord-set';

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';
export type FulfilmentStatus =
  | 'placed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'returned';

export interface ProductVariant {
  size: 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL' | 'Free Size';
  color: string;
  colorHex: string;
  stock: number;
  sku: string;
}

export interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  category: ProductCategory;
  subCategory: ProductSubCategory;
  price: number;
  comparePrice?: number;
  images: string[];
  glbModel?: string;
  variants: ProductVariant[];
  tags: string[];
  embroideryPattern?: string;
  isPublished: boolean;
  isFeatured: boolean;
  metaTitle?: string;
  metaDescription?: string;
  totalSold: number;
  averageRating: number;
  reviewCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  isEmailVerified: boolean;
  avatar?: string;
  phone?: string;
  storeCredit: number;
  wishlist: string[];
  addresses: Address[];
  createdAt: string;
}

export interface Address {
  _id?: string;
  label: string;
  name: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

export interface OrderItem {
  product: string;
  name: string;
  image: string;
  slug: string;
  size: string;
  color: string;
  colorHex: string;
  sku: string;
  quantity: number;
  price: number;
}

export interface Order {
  _id: string;
  user: string | User;
  items: OrderItem[];
  shippingAddress: Omit<Address, '_id' | 'label' | 'isDefault'>;
  paymentStatus: PaymentStatus;
  fulfilmentStatus: FulfilmentStatus;
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  couponCode?: string;
  discountAmount: number;
  subtotal: number;
  deliveryCharge: number;
  gstAmount: number;
  total: number;
  trackingNumber?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Coupon {
  _id: string;
  code: string;
  type: 'percent' | 'flat';
  value: number;
  minOrderValue: number;
  maxUses: number;
  usedCount: number;
  expiresAt: string;
  isActive: boolean;
}

export interface ApiResponse<T> {
  status: 'ok' | 'error';
  data?: T;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}
