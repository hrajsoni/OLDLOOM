import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User, UserRole } from '../models/User';
import { logger } from '../config/logger';

export interface AuthRequest extends Request {
  user?: {
    _id: string;
    role: UserRole;
    email: string;
  };
}

export const protect = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ status: 'error', message: 'Not authenticated' });
      return;
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET!) as {
      userId: string;
      role: UserRole;
    };

    const user = await User.findById(decoded.userId).select('_id email role isActive');
    if (!user || !user.isActive) {
      res.status(401).json({ status: 'error', message: 'User not found or deactivated' });
      return;
    }

    req.user = { _id: user._id.toString(), role: user.role, email: user.email };
    next();
  } catch (error) {
    logger.error(`Auth middleware error: ${error}`);
    res.status(401).json({ status: 'error', message: 'Invalid or expired token' });
  }
};

export const requireRole = (...roles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ status: 'error', message: 'Insufficient permissions' });
      return;
    }
    next();
  };
};
