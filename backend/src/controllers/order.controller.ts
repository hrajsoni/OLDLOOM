import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import Razorpay from 'razorpay';
import { Order } from '../models/Order';
import { Product } from '../models/Product';
import { Coupon } from '../models/Coupon';
import { User } from '../models/User';
import { AppError } from '../middleware/errorHandler';
import * as emailUtils from '../utils/email';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || '',
  key_secret: process.env.RAZORPAY_KEY_SECRET || '',
});

export async function createRazorpayOrder(req: Request, res: Response, next: NextFunction) {
  try {
    const { items, shippingAddress, couponCode } = req.body;
    
    // 1. Validate items and stock
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) throw new AppError(`Product ${item.productId} not found`, 404);

      const variant = product.variants.find(v => v.sku === item.sku);
      if (!variant) throw new AppError(`Variant ${item.sku} not found`, 404);
      if (variant.stock < item.quantity) {
        throw new AppError(`Insufficient stock for ${product.name} (${item.sku})`, 400);
      }

      subtotal += product.price * item.quantity;
      orderItems.push({
        product: product._id,
        name: product.name,
        image: product.images[0],
        slug: product.slug,
        size: variant.size,
        color: variant.color,
        colorHex: variant.colorHex,
        sku: variant.sku,
        quantity: item.quantity,
        price: product.price,
      });
    }

    // 2. Coupon calculation
    let discount = 0;
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true });
      if (coupon && subtotal >= coupon.minOrderValue && coupon.expiresAt > new Date() && coupon.usedCount < coupon.maxUses) {
        if (coupon.type === 'percent') {
          discount = (subtotal * coupon.value) / 100;
        } else {
          discount = coupon.value;
        }
        discount = Math.min(discount, subtotal);
      }
    }

    // 3. Totals
    const delivery = subtotal >= 999 ? 0 : 79;
    const taxableAmount = subtotal - discount + delivery;
    const gst = Math.round(taxableAmount * 0.18);
    const total = taxableAmount; // User said total includes GST in part 3 description: "total"

    // 4. Create Razorpay Order
    const rzpOrder = await razorpay.orders.create({
      amount: Math.round(total * 100), // in paise
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
    });

    res.json({
      status: 'ok',
      data: {
        razorpayOrderId: rzpOrder.id,
        amount: rzpOrder.amount,
        currency: rzpOrder.currency,
        key: process.env.RAZORPAY_KEY_ID,
        orderDetails: {
          subtotal,
          discount,
          delivery,
          gst,
          total,
        }
      }
    });
  } catch (err) {
    next(err);
  }
}

export async function verifyPayment(req: Request, res: Response, next: NextFunction) {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      address,
      items,
      subtotal,
      delivery,
      discount,
      couponCode,
      total
    } = req.body;

    // 1. Verify signature
    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "")
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature !== expectedSign) {
      throw new AppError('Invalid payment signature', 400);
    }

    // 2. Create Order in DB
    const order = await Order.create({
      user: req.user?._id,
      items,
      shippingAddress: address,
      paymentStatus: 'paid',
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      couponCode,
      discountAmount: discount,
      subtotal,
      deliveryCharge: delivery,
      gstAmount: Math.round((subtotal - discount + delivery) * 0.18),
      total,
    });

    // 3. Decrement stock and increment totalSold
    for (const item of items) {
      await Product.updateOne(
        { _id: item.product, "variants.sku": item.sku },
        { 
          $inc: { 
            "variants.$.stock": -item.quantity,
            totalSold: item.quantity 
          } 
        }
      );
    }

    // 4. Increment coupon usedCount
    if (couponCode) {
      await Coupon.updateOne({ code: couponCode.toUpperCase() }, { $inc: { usedCount: 1 } });
    }

    // 5. Send confirmation email
    const user = await User.findById(req.user?._id);
    if (user) {
      await emailUtils.sendOrderConfirmation(user.email, user.name, order);
    }

    res.json({ status: 'ok', data: order });
  } catch (err) {
    next(err);
  }
}

export async function getMyOrders(req: Request, res: Response, next: NextFunction) {
  try {
    const page = parseInt(req.query.page as string || '1');
    const limit = parseInt(req.query.limit as string || '10');
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      Order.find({ user: req.user?._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Order.countDocuments({ user: req.user?._id }),
    ]);

    res.json({
      status: 'ok',
      data: orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      }
    });
  } catch (err) {
    next(err);
  }
}

export async function getOrderById(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const order = await Order.findById(id).lean();

    if (!order) throw new AppError('Order not found', 404);

    const isOwner = order.user.toString() === req.user?._id.toString();
    const isStaff = ['admin', 'manager', 'support_staff'].includes(req.user?.role || '');

    if (!isOwner && !isStaff) {
      throw new AppError('Unauthorized access to order', 403);
    }

    res.json({ status: 'ok', data: order });
  } catch (err) {
    next(err);
  }
}

export async function razorpayWebhook(req: Request, res: Response, next: NextFunction) {
  // Optional: Implementation for webhook to handle async payment successes
  res.status(200).send('Webhook received');
}
