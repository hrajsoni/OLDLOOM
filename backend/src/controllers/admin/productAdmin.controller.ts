import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth';
import { Product } from '../../models/Product';
import { z } from 'zod';

const VariantSchema = z.object({
  size: z.enum(['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free Size']),
  color: z.string().min(1),
  colorHex: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  stock: z.number().min(0),
  sku: z.string().min(1),
});

const ProductSchema = z.object({
  name: z.string().min(2).max(200),
  description: z.string().min(10),
  category: z.enum(['men', 'women', 'couples']),
  subCategory: z.enum(['tshirt', 'hoodie', 'cap', 'jogger', 'trouser', 'short', 'coord-set']),
  price: z.number().min(1),
  comparePrice: z.number().optional(),
  images: z.array(z.string().url()).min(1),
  glbModel: z.string().optional(),
  variants: z.array(VariantSchema).min(1),
  tags: z.array(z.string()),
  embroideryPattern: z.string().optional(),
  isPublished: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
});

export const listProducts = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = req.query.search as string;
    const category = req.query.category as string;
    const isPublished = req.query.isPublished;

    const filter: Record<string, unknown> = {};
    if (search) filter.$text = { $search: search };
    if (category) filter.category = category;
    if (isPublished !== undefined) filter.isPublished = isPublished === 'true';

    const [products, total] = await Promise.all([
      Product.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .select('name slug category subCategory price comparePrice images isPublished isFeatured totalSold variants'),
      Product.countDocuments(filter),
    ]);

    res.json({
      status: 'ok',
      data: products,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch {
    res.status(500).json({ status: 'error', message: 'Failed to list products' });
  }
};

export const getProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      res.status(404).json({ status: 'error', message: 'Product not found' });
      return;
    }
    res.json({ status: 'ok', data: product });
  } catch {
    res.status(500).json({ status: 'error', message: 'Failed to fetch product' });
  }
};

export const createProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const validated = ProductSchema.parse(req.body);
    const product = await Product.create(validated);
    res.status(201).json({ status: 'ok', data: product });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ status: 'error', message: 'Validation failed', errors: error.errors });
      return;
    }
    res.status(500).json({ status: 'error', message: 'Failed to create product' });
  }
};

export const updateProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const validated = ProductSchema.partial().parse(req.body);
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: validated },
      { new: true, runValidators: true }
    );
    if (!product) {
      res.status(404).json({ status: 'error', message: 'Product not found' });
      return;
    }
    res.json({ status: 'ok', data: product });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ status: 'error', message: 'Validation failed', errors: error.errors });
      return;
    }
    res.status(500).json({ status: 'error', message: 'Failed to update product' });
  }
};

export const deleteProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      res.status(404).json({ status: 'error', message: 'Product not found' });
      return;
    }
    res.json({ status: 'ok', message: 'Product deleted' });
  } catch {
    res.status(500).json({ status: 'error', message: 'Failed to delete product' });
  }
};

export const bulkUpdate = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { ids, action } = req.body as { ids: string[]; action: 'publish' | 'unpublish' | 'delete' };

    if (!ids?.length) {
      res.status(400).json({ status: 'error', message: 'No IDs provided' });
      return;
    }

    if (action === 'delete') {
      await Product.deleteMany({ _id: { $in: ids } });
    } else {
      await Product.updateMany(
        { _id: { $in: ids } },
        { $set: { isPublished: action === 'publish' } }
      );
    }

    res.json({ status: 'ok', message: `Bulk ${action} complete` });
  } catch {
    res.status(500).json({ status: 'error', message: 'Bulk operation failed' });
  }
};
