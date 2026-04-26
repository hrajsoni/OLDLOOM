import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth';
import { AuditLog } from '../../models/AuditLog';

export const getLogs = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const { action, userId } = req.query;

    const filter: Record<string, unknown> = {};
    if (action) filter.action = action;
    if (userId) filter.user = userId;

    const [logs, total] = await Promise.all([
      AuditLog.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('user', 'name email role'),
      AuditLog.countDocuments(filter),
    ]);

    res.json({
      status: 'ok',
      data: logs,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch {
    res.status(500).json({ status: 'error', message: 'Failed to fetch audit logs' });
  }
};
