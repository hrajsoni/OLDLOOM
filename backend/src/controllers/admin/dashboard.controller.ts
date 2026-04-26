import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth';
import { Order } from '../../models/Order';
import { Product } from '../../models/Product';
import { User } from '../../models/User';

export const getStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - 7);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      todayOrders,
      weekOrders,
      monthOrders,
      totalOrders,
      activeProducts,
      totalCustomers,
      lowStockCount,
    ] = await Promise.all([
      Order.aggregate([
        { $match: { createdAt: { $gte: startOfDay }, paymentStatus: 'paid' } },
        { $group: { _id: null, revenue: { $sum: '$total' }, count: { $sum: 1 } } },
      ]),
      Order.aggregate([
        { $match: { createdAt: { $gte: startOfWeek }, paymentStatus: 'paid' } },
        { $group: { _id: null, revenue: { $sum: '$total' }, count: { $sum: 1 } } },
      ]),
      Order.aggregate([
        { $match: { createdAt: { $gte: startOfMonth }, paymentStatus: 'paid' } },
        { $group: { _id: null, revenue: { $sum: '$total' }, count: { $sum: 1 } } },
      ]),
      Order.countDocuments(),
      Product.countDocuments({ isPublished: true }),
      User.countDocuments({ role: 'customer' }),
      Product.countDocuments({ 'variants.stock': { $lt: 5 }, isPublished: true }),
    ]);

    res.json({
      status: 'ok',
      data: {
        revenue: {
          today: todayOrders[0]?.revenue ?? 0,
          week: weekOrders[0]?.revenue ?? 0,
          month: monthOrders[0]?.revenue ?? 0,
        },
        orders: {
          today: todayOrders[0]?.count ?? 0,
          week: weekOrders[0]?.count ?? 0,
          month: monthOrders[0]?.count ?? 0,
          total: totalOrders,
        },
        activeProducts,
        totalCustomers,
        lowStockCount,
      },
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Failed to fetch stats' });
  }
};

export const getRevenueChart = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const days = parseInt(req.query.days as string) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const data = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          paymentStatus: 'paid',
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          revenue: { $sum: '$total' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({ status: 'ok', data });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Failed to fetch revenue chart' });
  }
};

export const getTopProducts = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const data = await Product.find({ isPublished: true })
      .sort({ totalSold: -1 })
      .limit(5)
      .select('name images price totalSold averageRating category');

    res.json({ status: 'ok', data });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Failed to fetch top products' });
  }
};

export const getRecentOrders = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const data = await Order.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('user', 'name email')
      .select('_id total paymentStatus fulfilmentStatus createdAt items');

    res.json({ status: 'ok', data });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Failed to fetch recent orders' });
  }
};
