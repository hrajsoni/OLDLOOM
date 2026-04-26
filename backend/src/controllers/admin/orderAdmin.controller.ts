import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth';
import { Order } from '../../models/Order';
import Razorpay from 'razorpay';
import { Parser } from 'json2csv';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export const listOrders = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const { paymentStatus, fulfilmentStatus, search } = req.query;

    const filter: Record<string, unknown> = {};
    if (paymentStatus) filter.paymentStatus = paymentStatus;
    if (fulfilmentStatus) filter.fulfilmentStatus = fulfilmentStatus;

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('user', 'name email phone'),
      Order.countDocuments(filter),
    ]);

    res.json({
      status: 'ok',
      data: orders,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch {
    res.status(500).json({ status: 'error', message: 'Failed to list orders' });
  }
};

export const getOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email phone');
    if (!order) {
      res.status(404).json({ status: 'error', message: 'Order not found' });
      return;
    }
    res.json({ status: 'ok', data: order });
  } catch {
    res.status(500).json({ status: 'error', message: 'Failed to fetch order' });
  }
};

export const updateOrderStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { fulfilmentStatus, trackingNumber } = req.body;

    const validStatuses = ['placed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'];
    if (!validStatuses.includes(fulfilmentStatus)) {
      res.status(400).json({ status: 'error', message: 'Invalid status' });
      return;
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          fulfilmentStatus,
          ...(trackingNumber && { trackingNumber }),
        },
      },
      { new: true }
    );

    if (!order) {
      res.status(404).json({ status: 'error', message: 'Order not found' });
      return;
    }

    res.json({ status: 'ok', data: order });
  } catch {
    res.status(500).json({ status: 'error', message: 'Failed to update order' });
  }
};

export const processRefund = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      res.status(404).json({ status: 'error', message: 'Order not found' });
      return;
    }

    if (!order.razorpayPaymentId) {
      res.status(400).json({ status: 'error', message: 'No payment ID found for this order' });
      return;
    }

    if (order.paymentStatus === 'refunded') {
      res.status(400).json({ status: 'error', message: 'Order already refunded' });
      return;
    }

    const refundAmount = req.body.amount || order.total * 100; // Razorpay uses paise

    await razorpay.payments.refund(order.razorpayPaymentId, {
      amount: Math.round(refundAmount * 100),
      speed: 'normal',
      notes: { reason: req.body.reason || 'Admin initiated refund' },
    });

    await Order.findByIdAndUpdate(order._id, {
      $set: {
        paymentStatus: 'refunded',
        fulfilmentStatus: 'returned',
      },
    });

    res.json({ status: 'ok', message: 'Refund initiated successfully' });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message || 'Refund failed' });
  }
};

export const exportCSV = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const orders = await Order.find({ paymentStatus: 'paid' })
      .sort({ createdAt: -1 })
      .populate('user', 'name email')
      .lean();

    const fields = [
      '_id', 'createdAt', 'total', 'paymentStatus',
      'fulfilmentStatus', 'trackingNumber',
      'shippingAddress.name', 'shippingAddress.city',
      'shippingAddress.state', 'shippingAddress.pincode',
    ];

    const parser = new Parser({ fields });
    const csv = parser.parse(orders);

    res.header('Content-Type', 'text/csv');
    res.attachment(`orders-${Date.now()}.csv`);
    res.send(csv);
  } catch {
    res.status(500).json({ status: 'error', message: 'Export failed' });
  }
};
