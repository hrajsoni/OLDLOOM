import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth';
import { User, UserRole } from '../../models/User';
import { AuditLog } from '../../models/AuditLog';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

const STAFF_ROLES: UserRole[] = ['support_staff', 'content_editor', 'manager', 'super_admin'];

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const listStaff = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const staff = await User.find({ role: { $in: STAFF_ROLES } })
      .select('name email role isActive lastLoginAt createdAt invitedBy')
      .populate('invitedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({ status: 'ok', data: staff });
  } catch {
    res.status(500).json({ status: 'error', message: 'Failed to list staff' });
  }
};

export const inviteStaff = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { email, role, name } = req.body as { email: string; role: UserRole; name: string };

    if (!STAFF_ROLES.includes(role) || role === 'super_admin') {
      res.status(400).json({ status: 'error', message: 'Invalid role for invitation' });
      return;
    }

    const existing = await User.findOne({ email });
    if (existing) {
      res.status(409).json({ status: 'error', message: 'User with this email already exists' });
      return;
    }

    const inviteToken = crypto.randomBytes(32).toString('hex');
    const inviteExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const newStaff = await User.create({
      name,
      email,
      role,
      isActive: false,
      isEmailVerified: false,
      provider: 'credentials',
      invitedBy: req.user!._id,
      staffInviteToken: inviteToken,
      staffInviteExpiry: inviteExpiry,
    });

    const inviteUrl = `${process.env.CLIENT_URL}/admin/accept-invite?token=${inviteToken}`;

    await transporter.sendMail({
      from: `"Old Loom Admin" <${process.env.SMTP_FROM}>`,
      to: email,
      subject: `You've been invited to join Old Loom as ${role.replace('_', ' ')}`,
      html: `
        <div style="font-family: 'DM Mono', monospace; background: #1A1612; color: #F5F0E8; padding: 40px;">
          <h2 style="color: #C9A84C;">Old Loom Staff Invitation</h2>
          <p>Hi ${name},</p>
          <p>You've been invited to join the Old Loom admin panel as <strong>${role.replace('_', ' ')}</strong>.</p>
          <p>Click the button below to set up your account:</p>
          <a href="${inviteUrl}" style="
            display: inline-block; background: #C9A84C; color: #1A1612;
            padding: 12px 24px; text-decoration: none; font-weight: bold;
            border-radius: 4px; margin: 20px 0;
          ">Accept Invitation</a>
          <p style="color: #888;">This link expires in 7 days.</p>
        </div>
      `,
    });

    res.status(201).json({
      status: 'ok',
      message: `Invitation sent to ${email}`,
      data: { id: newStaff._id, email, role },
    });
  } catch {
    res.status(500).json({ status: 'error', message: 'Failed to invite staff' });
  }
};

export const changeRole = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { role } = req.body as { role: UserRole };

    if (!STAFF_ROLES.includes(role)) {
      res.status(400).json({ status: 'error', message: 'Invalid role' });
      return;
    }

    // Prevent changing own role
    if (req.params.id === req.user!._id) {
      res.status(400).json({ status: 'error', message: 'Cannot change your own role' });
      return;
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: { role } },
      { new: true }
    ).select('name email role isActive');

    if (!user) {
      res.status(404).json({ status: 'error', message: 'Staff not found' });
      return;
    }

    res.json({ status: 'ok', data: user });
  } catch {
    res.status(500).json({ status: 'error', message: 'Failed to change role' });
  }
};

export const toggleActive = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (req.params.id === req.user!._id) {
      res.status(400).json({ status: 'error', message: 'Cannot deactivate yourself' });
      return;
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404).json({ status: 'error', message: 'Staff not found' });
      return;
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({
      status: 'ok',
      data: { isActive: user.isActive },
      message: `Staff ${user.isActive ? 'activated' : 'suspended'}`,
    });
  } catch {
    res.status(500).json({ status: 'error', message: 'Failed to toggle staff status' });
  }
};

export const getActivity = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = 20;

    const [logs, total] = await Promise.all([
      AuditLog.find({ user: req.params.id })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      AuditLog.countDocuments({ user: req.params.id }),
    ]);

    res.json({
      status: 'ok',
      data: logs,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch {
    res.status(500).json({ status: 'error', message: 'Failed to fetch activity' });
  }
};
