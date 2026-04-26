import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { Order } from '../models/Order';

// POST /api/v1/orders/webhook
export async function razorpayWebhook(req: Request, res: Response, next: NextFunction) {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET || 'dummy_webhook_secret';
    const signature = req.headers['x-razorpay-signature'];

    if (!signature) {
      res.status(400).send('Missing signature');
      return;
    }

    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(JSON.stringify(req.body))
      .digest('hex');

    if (expectedSignature !== signature) {
      res.status(400).send('Invalid signature');
      return;
    }

    const event = req.body.event;

    if (event === 'payment.captured') {
      const payment = req.body.payload.payment.entity;
      const orderId = payment.order_id;
      
      // Update order status in DB
      await Order.findOneAndUpdate(
        { 'paymentInfo.razorpayOrderId': orderId },
        { status: 'processing', 'paymentInfo.status': 'paid' }
      );
    }

    res.status(200).send('OK');
  } catch (err) {
    next(err);
  }
}
