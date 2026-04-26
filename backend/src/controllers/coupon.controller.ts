import { Request, Response, NextFunction } from 'express';
import { Coupon } from '../models/Coupon';
import { AppError } from '../middleware/errorHandler';

export async function validateCoupon(req: Request, res: Response, next: NextFunction) {
  try {
    const { code, orderSubtotal } = req.body;
    if (!code) throw new AppError('Coupon code required', 400);

    const coupon = await Coupon.findOne({
      code: code.toUpperCase(),
      isActive: true,
    });

    if (!coupon) {
      return res.json({ status: 'ok', data: { valid: false, message: 'Invalid coupon code' } });
    }

    if (coupon.expiresAt < new Date()) {
      return res.json({ status: 'ok', data: { valid: false, message: 'Coupon has expired' } });
    }

    if (coupon.usedCount >= coupon.maxUses) {
      return res.json({ status: 'ok', data: { valid: false, message: 'Coupon usage limit reached' } });
    }

    if (orderSubtotal < coupon.minOrderValue) {
      return res.json({
        status: 'ok',
        data: {
          valid: false,
          message: `Minimum order value of ₹${coupon.minOrderValue} required`,
        },
      });
    }

    let discount = 0;
    if (coupon.type === 'percent') {
      discount = (orderSubtotal * coupon.value) / 100;
    } else {
      discount = coupon.value;
    }

    // Cap discount
    discount = Math.min(discount, orderSubtotal);

    res.json({
      status: 'ok',
      data: {
        valid: true,
        code: coupon.code,
        type: coupon.type,
        value: coupon.value,
        discount,
        message: 'Coupon applied successfully',
      },
    });
  } catch (err) {
    next(err);
  }
}
