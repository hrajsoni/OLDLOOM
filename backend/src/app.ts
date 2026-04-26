import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import { logger } from './config/logger';
import { notFound, globalErrorHandler } from './middleware/errorHandler';

// Route imports
import healthRouter from './routes/health';
import productRouter from './routes/product.route';
import orderRouter from './routes/order.route';
import couponRouter from './routes/coupon.route';
import authRouter from './routes/auth.route';
import adminRouter from './routes/admin.route';
import wishlistRouter from './routes/wishlist.route';
import addressRouter from './routes/address.route';
import contentRouter from './routes/content.route';

const app = express();

// ── Security Headers ──────────────────────────────────────────────────────────
app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: false,
  })
);

// ── CORS ──────────────────────────────────────────────────────────────────────
const allowedOrigins = [
  process.env.CLIENT_URL,
  process.env.ADMIN_URL,
  'http://localhost:3000',
].filter(Boolean) as string[];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl)
      if (!origin) return callback(null, true);
      
      const isAllowed = allowedOrigins.includes(origin) || 
                       (process.env.NODE_ENV === 'development' && origin.startsWith('http://localhost:')) ||
                       origin.endsWith('.vercel.app'); // Allow Vercel previews

      if (isAllowed) {
        callback(null, true);
      } else {
        callback(new Error(`CORS blocked: ${origin}`));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// ── Body Parsing ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// ── Sanitization ──────────────────────────────────────────────────────────────
app.use(mongoSanitize());
app.use(hpp());

// ── Logger ────────────────────────────────────────────────────────────────────
app.use(
  morgan('combined', {
    stream: { write: (message) => logger.http(message.trim()) },
  })
);

// ── Global Rate Limit ─────────────────────────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests, please try again later.' },
});
app.use('/api', globalLimiter);

// ── Strict Rate Limit for Auth ────────────────────────────────────────────────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many auth attempts, please try again in 15 minutes.' },
});
app.use('/api/v1/auth/login', authLimiter);
app.use('/api/v1/auth/register', authLimiter);
app.use('/api/v1/auth/forgot-password', authLimiter);

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/v1', healthRouter);
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/products', productRouter);
app.use('/api/v1/orders', orderRouter);
app.use('/api/v1/coupons', couponRouter);
app.use('/api/v1/admin', adminRouter);
app.use('/api/v1/wishlist', wishlistRouter);
app.use('/api/v1/user/addresses', addressRouter);
app.use('/api/v1/content', contentRouter);

// ── 404 + Global Error Handler ────────────────────────────────────────────────
app.use(notFound);
app.use(globalErrorHandler);

export default app;
