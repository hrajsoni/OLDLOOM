import { Request, Response, NextFunction } from 'express';
import { logger } from '../config/logger';

export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

// 404 handler — call when no route matched
export const notFound = (req: Request, res: Response, next: NextFunction): void => {
  next(new AppError(`Route ${req.method} ${req.originalUrl} not found`, 404));
};

// Global error handler
export const globalErrorHandler = (
  err: AppError & { code?: number; path?: string; value?: string },
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void => {
  const statusCode = err.statusCode || 500;
  const isProduction = process.env.NODE_ENV === 'production';

  // Log all errors
  logger.error({
    message: err.message,
    statusCode,
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    stack: isProduction ? undefined : err.stack,
  });

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = err.message.match(/index: (.+)_1/)?.[1] ?? 'field';
    res.status(409).json({
      status: 'error',
      message: `${field} already exists`,
    });
    return;
  }

  // Mongoose cast error (invalid ObjectId)
  if (err.name === 'CastError') {
    res.status(400).json({
      status: 'error',
      message: `Invalid ${err.path}: ${err.value}`,
    });
    return;
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    res.status(401).json({
      status: 'error',
      message: 'Invalid token',
    });
    return;
  }

  if (err.name === 'TokenExpiredError') {
    res.status(401).json({
      status: 'error',
      message: 'Token expired',
    });
    return;
  }

  // Zod validation errors (pass-through from controllers)
  if (err.name === 'ZodError') {
    res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors: (err as any).errors,
    });
    return;
  }

  // Operational errors — safe to expose message
  if (err.isOperational) {
    res.status(statusCode).json({
      status: 'error',
      message: err.message,
    });
    return;
  }

  // Programming/unknown errors — hide details in production
  res.status(500).json({
    status: 'error',
    message: isProduction ? 'Internal server error' : err.message,
    ...(isProduction ? {} : { stack: err.stack }),
  });
};
