import { Request, Response, NextFunction } from 'express';
import { Product } from '../models/Product';
import { AppError } from '../middleware/errorHandler';

export async function listProducts(req: Request, res: Response, next: NextFunction) {
  try {
    const {
      category,
      subCategory,
      minPrice,
      maxPrice,
      tags,
      inStock,
      search,
      sort = 'newest',
      page = '1',
      limit = '12',
    } = req.query;

    const query: any = { isPublished: true };

    if (category) query.category = category;
    if (subCategory) query.subCategory = subCategory;

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    if (tags) {
      const tagList = (tags as string).split(',').map(t => t.trim());
      query.tags = { $in: tagList };
    }

    if (inStock === 'true') {
      query['variants.stock'] = { $gt: 0 };
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    let sortQuery: Record<string, 1 | -1> = { createdAt: -1 };
    if (sort === 'price_asc'  || sort === 'price-asc')  sortQuery = { price: 1 };
    if (sort === 'price_desc' || sort === 'price-desc') sortQuery = { price: -1 };
    if (sort === 'popular')  sortQuery = { totalSold: -1 };
    if (sort === 'newest')   sortQuery = { createdAt: -1 };
    if (sort === 'oldest')   sortQuery = { createdAt: 1 };

    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    const [products, total] = await Promise.all([
      Product.find(query)
        .sort(sortQuery)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Product.countDocuments(query),
    ]);

    const totalPages = Math.ceil(total / limitNum);

    res.json({
      status: 'ok',
      data: products,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages,
        hasNext: pageNum < totalPages,
        hasPrev: pageNum > 1,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getProduct(req: Request, res: Response, next: NextFunction) {
  try {
    const { slug } = req.params;
    const product = await Product.findOne({ slug, isPublished: true }).lean();

    if (!product) throw new AppError('Product not found', 404);

    const related = await Product.find({
      category: (product as any).category,
      _id: { $ne: (product as any)._id },
      isPublished: true,
    })
      .sort({ totalSold: -1 })
      .limit(4)
      .lean();

    res.json({ status: 'ok', data: product, related });
  } catch (err) {
    next(err);
  }
}

export async function getFeaturedProducts(req: Request, res: Response, next: NextFunction) {
  try {
    const products = await Product.find({ isFeatured: true, isPublished: true })
      .sort({ totalSold: -1 })
      .limit(6)
      .lean();

    res.json({ status: 'ok', data: products });
  } catch (err) {
    next(err);
  }
}
