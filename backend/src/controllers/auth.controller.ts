import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { User } from '../models/User';
import { AppError } from '../middleware/errorHandler';
import * as emailUtils from '../utils/email';

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'access_secret_fallback';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'refresh_secret_fallback';
const ACCESS_EXPIRES_IN = '15m';
const REFRESH_EXPIRES_IN = '7d';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: true, // Required for sameSite: 'none'
  sameSite: 'none' as const, // Required for cross-origin (Vercel -> Render)
  path: '/', // Broaden path for easier cookie management
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

// ── Validation Schemas ────────────────────────────────────────────────────────

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8).regex(/[0-9]/).regex(/[^A-Za-z0-9]/),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

const updateMeSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().optional(),
  avatar: z.string().optional(),
});

// ── Helpers ──────────────────────────────────────────────────────────────────

function generateTokens(userId: string, role: string) {
  const accessToken = jwt.sign({ userId, role }, JWT_ACCESS_SECRET, { expiresIn: ACCESS_EXPIRES_IN });
  const refreshToken = jwt.sign({ userId, tokenVersion: Date.now() }, JWT_REFRESH_SECRET, { expiresIn: REFRESH_EXPIRES_IN });
  return { accessToken, refreshToken };
}

function hashToken(token: string) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

// ── Controllers ──────────────────────────────────────────────────────────────

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const validated = registerSchema.parse(req.body);
    
    const existing = await User.findOne({ email: validated.email });
    if (existing) throw new AppError('Email already registered', 409);

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    const user = await User.create({
      ...validated,
      role: 'customer',
      emailVerifyOtp: otp,
      emailVerifyOtpExpiry: otpExpiry,
    });

    await emailUtils.sendVerificationEmail(user.email, user.name, otp);

    res.status(201).json({
      status: 'ok',
      message: 'Verification OTP sent to email',
      user: { _id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    next(err);
  }
}

export async function verifyEmail(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email }).select('+emailVerifyOtp +emailVerifyOtpExpiry');
    
    if (!user) throw new AppError('User not found', 404);
    if (user.isEmailVerified) throw new AppError('Email already verified', 400);
    
    if (user.emailVerifyOtp !== otp || !user.emailVerifyOtpExpiry || user.emailVerifyOtpExpiry < new Date()) {
      throw new AppError('Invalid or expired OTP', 400);
    }

    user.isEmailVerified = true;
    user.emailVerifyOtp = undefined;
    user.emailVerifyOtpExpiry = undefined;
    await user.save();

    res.json({ status: 'ok', message: 'Email verified' });
  } catch (err) {
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const validated = loginSchema.parse(req.body);
    const user = await User.findOne({ email: validated.email }).select('+password');

    if (!user || !(await user.comparePassword(validated.password))) {
      throw new AppError('Invalid email or password', 401);
    }

    if (!user.isActive) throw new AppError('Account deactivated', 403);

    const { accessToken, refreshToken } = generateTokens(user._id.toString(), user.role);

    user.refreshToken = hashToken(refreshToken);
    user.lastLoginAt = new Date();
    await user.save();

    res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS);

    res.json({
      status: 'ok',
      accessToken,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function refresh(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.cookies.refreshToken;
    if (!token) throw new AppError('No refresh token', 401);

    const decoded = jwt.verify(token, JWT_REFRESH_SECRET) as { userId: string };
    const user = await User.findById(decoded.userId).select('+refreshToken');

    if (!user || user.refreshToken !== hashToken(token)) {
      throw new AppError('Invalid refresh token', 401);
    }

    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user._id.toString(), user.role);

    user.refreshToken = hashToken(newRefreshToken);
    await user.save();

    res.cookie('refreshToken', newRefreshToken, COOKIE_OPTIONS);
    res.json({ status: 'ok', accessToken });
  } catch (err) {
    next(new AppError('Session expired', 401));
  }
}

export async function logout(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.cookies.refreshToken;
    if (token) {
      await User.findOneAndUpdate({ refreshToken: hashToken(token) }, { refreshToken: null });
    }
    res.clearCookie('refreshToken', { path: '/api/v1/auth' });
    res.json({ status: 'ok', message: 'Logged out' });
  } catch (err) {
    next(err);
  }
}

export async function forgotPassword(req: Request, res: Response, next: NextFunction) {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    
    // Always return success to prevent enumeration
    if (user) {
      const resetToken = jwt.sign({ userId: user._id, purpose: 'reset' }, JWT_ACCESS_SECRET, { expiresIn: '1h' });
      user.resetPasswordToken = hashToken(resetToken);
      user.resetPasswordExpiry = new Date(Date.now() + 3600000);
      await user.save();

      const resetLink = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;
      await emailUtils.sendPasswordResetEmail(user.email, user.name, resetLink);
    }

    res.json({ status: 'ok', message: 'If the email exists, a reset link has been sent' });
  } catch (err) {
    next(err);
  }
}

export async function resetPassword(req: Request, res: Response, next: NextFunction) {
  try {
    const { token, newPassword } = req.body;
    
    const decoded = jwt.verify(token, JWT_ACCESS_SECRET) as { userId: string, purpose: string };
    if (decoded.purpose !== 'reset') throw new AppError('Invalid token', 400);

    const user = await User.findOne({
      _id: decoded.userId,
      resetPasswordToken: hashToken(token),
      resetPasswordExpiry: { $gt: new Date() },
    });

    if (!user) throw new AppError('Invalid or expired reset token', 400);

    user.password = newPassword; // Hashed in pre-save
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiry = undefined;
    user.refreshToken = undefined; // Invalidate all sessions
    await user.save();

    res.json({ status: 'ok', message: 'Password reset successful' });
  } catch (err) {
    next(err);
  }
}

export async function getMe(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await User.findById(req.user?._id).populate('wishlist').lean();
    if (!user) throw new AppError('User not found', 404);

    const { password, refreshToken, emailVerifyOtp, emailVerifyOtpExpiry, ...safeUser } = user as any;
    res.json({ status: 'ok', data: safeUser });
  } catch (err) {
    next(err);
  }
}

export async function updateMe(req: Request, res: Response, next: NextFunction) {
  try {
    const validated = updateMeSchema.parse(req.body);
    const user = await User.findByIdAndUpdate(
      req.user?._id,
      { $set: validated },
      { new: true, runValidators: true }
    ).lean();
    
    res.json({ status: 'ok', data: user });
  } catch (err) {
    next(err);
  }
}

export async function getGoogleRole(req: Request, res: Response, next: NextFunction) {
  try {
    const { email } = req.query;
    if (!email) throw new AppError('Email required', 400);

    const user = await User.findOne({ email: (email as string).toLowerCase() });
    res.json({ status: 'ok', role: user?.role || 'customer' });
  } catch (err) {
    next(err);
  }
}

export async function acceptInvite(req: Request, res: Response, next: NextFunction) {
  try {
    const { token, password } = req.body;
    const user = await User.findOne({
      staffInviteToken: token,
      staffInviteExpiry: { $gt: new Date() },
    }).select('+staffInviteToken +staffInviteExpiry');

    if (!user) throw new AppError('Invalid or expired invitation', 400);

    user.password = password;
    user.isActive = true;
    user.isEmailVerified = true;
    user.staffInviteToken = undefined;
    user.staffInviteExpiry = undefined;
    await user.save();

    res.json({ status: 'ok', message: 'Account activated' });
  } catch (err) {
    next(err);
  }
}
