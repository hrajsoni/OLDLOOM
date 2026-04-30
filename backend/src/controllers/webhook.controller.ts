import { Request, Response } from 'express';
import crypto from 'crypto';
import { Order } from '../models/Order';
import { logger } from '../config/logger';

export async function razorpayWebhook(req: Request, res: Response): Promise<void> {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || '';
  const signature = req.headers['x-razorpay-signature'] as string;

  // Raw body is captured by express.raw middleware mounted on this route in order.route.ts
  const body = (req as Request & { rawBody?: Buffer }).rawBody ?? Buffer.from(JSON.stringify(req.body));

  if (!signature || !webhookSecret) {
    logger.warn('Webhook: missing signature or secret — skipping');
    res.status(200).send('OK');
    return;
  }

  const expectedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(body)
    .digest('hex');

  if (expectedSignature !== signature) {
    logger.warn('Webhook: invalid signature received');
    res.status(200).send('OK'); // Always 200 so Razorpay doesn't retry infinitely
    return;
  }

  try {
    const event = JSON.parse(body.toString());
    const eventType: string = event.event;
    const payment = event.payload?.payment?.entity;

    if (eventType === 'payment.captured' && payment) {
      const order = await Order.findOne({
        razorpayOrderId: payment.order_id,
        paymentStatus: 'pending',
      });
      if (order) {
        order.paymentStatus = 'paid';
        order.razorpayPaymentId = payment.id;
        order.fulfilmentStatus = 'placed';
        await order.save();
        logger.info(`Webhook: payment.captured → order ${order._id} marked paid`);
      }
    }

    if (eventType === 'payment.failed' && payment) {
      const order = await Order.findOne({
        razorpayOrderId: payment.order_id,
        paymentStatus: 'pending',
      });
      if (order) {
        order.paymentStatus = 'failed';
        await order.save();
        logger.info(`Webhook: payment.failed → order ${order._id} marked failed`);
      }
    }
  } catch (err) {
    logger.error(`Webhook processing error: ${err}`);
  }

  res.status(200).send('OK');
}
