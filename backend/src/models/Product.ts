import mongoose, { Document, Schema } from 'mongoose';

export type ProductCategory = 'men' | 'women' | 'couples';
export type ProductSubCategory =
  | 'tshirt'
  | 'hoodie'
  | 'cap'
  | 'jogger'
  | 'trouser'
  | 'short'
  | 'coord-set';

export interface IVariant {
  size: 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL' | 'Free Size';
  color: string;
  colorHex: string;
  stock: number;
  sku: string;
}

export interface IProduct extends Document {
  name: string;
  slug: string;
  description: string;
  category: ProductCategory;
  subCategory: ProductSubCategory;
  price: number;
  comparePrice?: number;
  images: string[];
  glbModel?: string;
  variants: IVariant[];
  tags: string[];
  embroideryPattern?: string;
  isPublished: boolean;
  isFeatured: boolean;
  metaTitle?: string;
  metaDescription?: string;
  totalSold: number;
  averageRating: number;
  reviewCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const VariantSchema = new Schema<IVariant>({
  size: {
    type: String,
    enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free Size'],
    required: true,
  },
  color: { type: String, required: true },
  colorHex: { type: String, required: true, default: '#000000' },
  stock: { type: Number, required: true, min: 0, default: 0 },
  sku: { type: String, required: true, unique: true },
});

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, required: true },
    category: {
      type: String,
      enum: ['men', 'women', 'couples'],
      required: true,
    },
    subCategory: {
      type: String,
      enum: ['tshirt', 'hoodie', 'cap', 'jogger', 'trouser', 'short', 'coord-set'],
      required: true,
    },
    price: { type: Number, required: true, min: 0 },
    comparePrice: { type: Number, min: 0 },
    images: [{ type: String }],
    glbModel: String,
    variants: [VariantSchema],
    tags: [{ type: String, trim: true }],
    embroideryPattern: String,
    isPublished: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },
    metaTitle: String,
    metaDescription: String,
    totalSold: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Indexes for search and filtering
ProductSchema.index({ slug: 1 });
ProductSchema.index({ category: 1 });
ProductSchema.index({ subCategory: 1 });
ProductSchema.index({ price: 1 });
ProductSchema.index({ isPublished: 1, isFeatured: -1, totalSold: -1 });
ProductSchema.index({ tags: 1 });

// Auto-generate slug from name if not provided
ProductSchema.pre('validate', function (next) {
  if (!this.slug && this.name) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  next();
});

export const Product = mongoose.model<IProduct>('Product', ProductSchema);
