import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth';
import { Coupon } from '../../models/Coupon';
import { z } from 'zod';

const CouponSchema = z.object({
  code: z.string().min(3).max(20).toUpperCase(),
  type: z.enum(['percent', 'flat']),
  value: z.number().min(1),
  minOrderValue: z.number().min(0).default(0),
  maxUses: z.number().min(1).default(100),
  expiresAt: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
  isActive: z.boolean().default(true),
});

export const listCoupons = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json({ status: 'ok', data: coupons });
  } catch {
    res.status(500).json({ status: 'error', message: 'Failed to list coupons' });
  }
};

export const createCoupon = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const validated = CouponSchema.parse(req.body);
    const existing = await Coupon.findOne({ code: validated.code });
    if (existing) {
      res.status(409).json({ status: 'error', message: 'Coupon code already exists' });
      return;
    }
    const coupon = await Coupon.create(validated);
    res.status(201).json({ status: 'ok', data: coupon });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ status: 'error', message: 'Validation failed', errors: error.errors });
      return;
    }
    res.status(500).json({ status: 'error', message: 'Failed to create coupon' });
  }
};

export const updateCoupon = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    if (!coupon) {
      res.status(404).json({ status: 'error', message: 'Coupon not found' });
      return;
    }
    res.json({ status: 'ok', data: coupon });
  } catch {
    res.status(500).json({ status: 'error', message: 'Failed to update coupon' });
  }
};

export const deleteCoupon = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) {
      res.status(404).json({ status: 'error', message: 'Coupon not found' });
      return;
    }
    res.json({ status: 'ok', message: 'Coupon deleted' });
  } catch {
    res.status(500).json({ status: 'error', message: 'Failed to delete coupon' });
  }
};
