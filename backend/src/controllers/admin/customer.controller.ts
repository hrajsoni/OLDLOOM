import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth';
import { User } from '../../models/User';
import { Order } from '../../models/Order';

export const listCustomers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = req.query.search as string;

    const filter: Record<string, unknown> = { role: 'customer' };
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const [customers, total] = await Promise.all([
      User.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .select('name email phone isActive isEmailVerified storeCredit createdAt lastLoginAt'),
      User.countDocuments(filter),
    ]);

    // Get order stats for each customer
    const customerIds = customers.map((c) => c._id);
    const orderStats = await Order.aggregate([
      { $match: { user: { $in: customerIds }, paymentStatus: 'paid' } },
      {
        $group: {
          _id: '$user',
          totalOrders: { $sum: 1 },
          totalSpend: { $sum: '$total' },
        },
      },
    ]);

    const statsMap = new Map(orderStats.map((s) => [s._id.toString(), s]));

    const enriched = customers.map((c) => ({
      ...c.toObject(),
      totalOrders: statsMap.get(c._id.toString())?.totalOrders ?? 0,
      totalSpend: statsMap.get(c._id.toString())?.totalSpend ?? 0,
    }));

    res.json({
      status: 'ok',
      data: enriched,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch {
    res.status(500).json({ status: 'error', message: 'Failed to list customers' });
  }
};

export const getCustomer = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const customer = await User.findById(req.params.id)
      .select('-password -refreshToken -emailVerifyOtp -resetPasswordToken');

    if (!customer || customer.role !== 'customer') {
      res.status(404).json({ status: 'error', message: 'Customer not found' });
      return;
    }

    const orders = await Order.find({ user: customer._id })
      .sort({ createdAt: -1 })
      .limit(10)
      .select('_id total paymentStatus fulfilmentStatus createdAt');

    res.json({ status: 'ok', data: { customer, orders } });
  } catch {
    res.status(500).json({ status: 'error', message: 'Failed to fetch customer' });
  }
};

export const issueCredit = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { amount, reason } = req.body as { amount: number; reason: string };

    if (!amount || amount <= 0) {
      res.status(400).json({ status: 'error', message: 'Invalid amount' });
      return;
    }

    const customer = await User.findByIdAndUpdate(
      req.params.id,
      { $inc: { storeCredit: amount } },
      { new: true }
    ).select('name email storeCredit');

    if (!customer) {
      res.status(404).json({ status: 'error', message: 'Customer not found' });
      return;
    }

    res.json({
      status: 'ok',
      message: `₹${amount} store credit issued to ${customer.name}`,
      data: customer,
    });
  } catch {
    res.status(500).json({ status: 'error', message: 'Failed to issue credit' });
  }
};

export const toggleActive = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const customer = await User.findById(req.params.id);
    if (!customer || customer.role !== 'customer') {
      res.status(404).json({ status: 'error', message: 'Customer not found' });
      return;
    }

    customer.isActive = !customer.isActive;
    await customer.save();

    res.json({
      status: 'ok',
      data: { isActive: customer.isActive },
      message: `Customer ${customer.isActive ? 'activated' : 'blocked'}`,
    });
  } catch {
    res.status(500).json({ status: 'error', message: 'Failed to toggle customer' });
  }
};
