import { Router } from 'express';
import express from 'express';
import {
  createRazorpayOrder,
  verifyPayment,
  getMyOrders,
  getOrderById,
  cancelOrder,
} from '../controllers/order.controller';
import { razorpayWebhook } from '../controllers/webhook.controller';
import { protect } from '../middleware/auth';

const router = Router();

// Webhook needs raw body for HMAC verification — must come BEFORE express.json parses it
router.post('/webhook', express.raw({ type: 'application/json' }), razorpayWebhook);

router.post('/create-razorpay-order', protect, createRazorpayOrder);
router.post('/verify-payment', protect, verifyPayment);

router.get('/my-orders', protect, getMyOrders);
router.get('/:id', protect, getOrderById);
router.post('/:id/cancel', protect, cancelOrder);

export default router;
