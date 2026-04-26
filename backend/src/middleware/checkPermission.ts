import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
import { PermissionKey, hasPermission } from '../config/permissions';
import { AuditLog } from '../models/AuditLog';
import { logger } from '../config/logger';

export const checkPermission = (permission: PermissionKey) => {
  return async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      res.status(401).json({ status: 'error', message: 'Not authenticated' });
      return;
    }

    if (!hasPermission(req.user.role, permission)) {
      logger.warn(
        `Permission denied: ${req.user.email} (${req.user.role}) tried ${permission} on ${req.path}`
      );
      res.status(403).json({
        status: 'error',
        message: `Permission denied: requires ${permission}`,
      });
      return;
    }

    next();
  };
};

// Log admin action to AuditLog
export const auditLog = (action: string, target: string) => {
  return async (req: AuthRequest, _res: Response, next: NextFunction): Promise<void> => {
    if (req.user) {
      AuditLog.create({
        user: req.user._id,
        userEmail: req.user.email,
        role: req.user.role,
        action,
        target,
        targetId: req.params?.id,
        metadata: { body: req.body, query: req.query },
        ip: req.ip || req.socket?.remoteAddress || 'unknown',
        userAgent: req.headers['user-agent'],
      }).catch((err) => logger.error(`AuditLog failed: ${err.message}`));
    }
    next();
  };
};
