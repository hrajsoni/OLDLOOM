import { Router } from 'express';
import {
  createRazorpayOrder,
  verifyPayment,
  getMyOrders,
  getOrderById,
  razorpayWebhook,
} from '../controllers/order.controller';
import { protect } from '../middleware/auth';

const router = Router();

router.post('/create-razorpay-order', protect, createRazorpayOrder);
router.post('/verify-payment', protect, verifyPayment);
router.post('/webhook', razorpayWebhook);

router.get('/my-orders', protect, getMyOrders);
router.get('/:id', protect, getOrderById);

export default router;
