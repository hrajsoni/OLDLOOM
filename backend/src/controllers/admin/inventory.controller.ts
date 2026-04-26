import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth';
import { Product } from '../../models/Product';

export const getInventory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const products = await Product.find({ isPublished: true })
      .sort({ name: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .select('name slug images variants category subCategory');

    const total = await Product.countDocuments({ isPublished: true });

    res.json({
      status: 'ok',
      data: products,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch {
    res.status(500).json({ status: 'error', message: 'Failed to fetch inventory' });
  }
};

export const updateVariantStock = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { productId, sku } = req.params;
    const { stock } = req.body as { stock: number };

    if (typeof stock !== 'number' || stock < 0) {
      res.status(400).json({ status: 'error', message: 'Invalid stock value' });
      return;
    }

    const product = await Product.findOneAndUpdate(
      { _id: productId, 'variants.sku': sku },
      { $set: { 'variants.$.stock': stock } },
      { new: true }
    );

    if (!product) {
      res.status(404).json({ status: 'error', message: 'Product or variant not found' });
      return;
    }

    res.json({ status: 'ok', message: 'Stock updated', data: product });
  } catch {
    res.status(500).json({ status: 'error', message: 'Failed to update stock' });
  }
};

export const getLowStock = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const products = await Product.find({
      isPublished: true,
      'variants.stock': { $lt: 5 },
    }).select('name slug images variants category');

    const lowStockItems = products.flatMap((p) =>
      p.variants
        .filter((v) => v.stock < 5)
        .map((v) => ({
          productId: p._id,
          productName: p.name,
          productSlug: p.slug,
          image: p.images[0],
          sku: v.sku,
          size: v.size,
          color: v.color,
          stock: v.stock,
        }))
    );

    res.json({ status: 'ok', data: lowStockItems, total: lowStockItems.length });
  } catch {
    res.status(500).json({ status: 'error', message: 'Failed to fetch low stock' });
  }
};
