import { Router } from 'express';
import { validateCoupon } from '../controllers/coupon.controller';

const router = Router();

// POST /api/v1/coupons/validate
router.post('/validate', validateCoupon);

export default router;
