import { Router } from 'express';
import {
  register,
  verifyEmail,
  login,
  refresh,
  logout,
  forgotPassword,
  resetPassword,
  getMe,
  updateMe,
  getGoogleRole,
  acceptInvite,
} from '../controllers/auth.controller';
import { protect } from '../middleware/auth';

const router = Router();

// Public
router.post('/register', register);
router.post('/verify-email', verifyEmail);
router.post('/login', login);
router.post('/refresh', refresh);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/google-role', getGoogleRole);
router.post('/accept-invite', acceptInvite);

// Protected
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);
router.patch('/me', protect, updateMe);

export default router;
