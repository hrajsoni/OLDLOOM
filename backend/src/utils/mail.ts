import nodemailer from 'nodemailer';
import { logger } from '../config/logger';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.mailtrap.io',
  port: parseInt(process.env.SMTP_PORT || '2525', 10),
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  },
});

export async function sendMail({ to, subject, html }: { to: string; subject: string; html: string }) {
  try {
    const info = await transporter.sendMail({
      from: `"Old Loom" <${process.env.SMTP_FROM || 'noreply@oldloom.in'}>`,
      to,
      subject,
      html,
    });
    logger.info(`Email sent: ${info.messageId}`);
    return info;
  } catch (error) {
    logger.error(`Error sending email: ${(error as Error).message}`);
    throw error;
  }
}

export const emailTemplates = {
  verification: (otp: string) => `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #C9A84C; border-radius: 8px;">
      <h2 style="color: #C9A84C; text-align: center;">Verify Your Email</h2>
      <p style="color: #3D2B1F; font-size: 16px;">Welcome to Old Loom! Use the OTP below to verify your account:</p>
      <div style="background: #F5F0E8; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; color: #1A1612; letter-spacing: 10px; margin: 20px 0;">
        ${otp}
      </div>
      <p style="color: #3D2B1F; font-size: 14px;">This OTP will expire in 15 minutes.</p>
      <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
      <p style="font-size: 12px; color: #999; text-align: center;">If you didn't request this, please ignore this email.</p>
    </div>
  `,
  passwordReset: (url: string) => `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #C9A84C; border-radius: 8px;">
      <h2 style="color: #C9A84C; text-align: center;">Reset Your Password</h2>
      <p style="color: #3D2B1F; font-size: 16px;">Click the button below to reset your password for Old Loom:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${url}" style="background: #C9A84C; color: #1A1612; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; text-transform: uppercase;">Reset Password</a>
      </div>
      <p style="color: #3D2B1F; font-size: 14px;">If the button doesn't work, copy and paste this link:</p>
      <p style="word-break: break-all; font-size: 12px; color: #C9A84C;">${url}</p>
      <p style="color: #3D2B1F; font-size: 14px;">This link will expire in 1 hour.</p>
    </div>
  `,
  orderConfirmation: (order: any) => `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #C9A84C; border-radius: 8px;">
      <h2 style="color: #C9A84C; text-align: center;">Order Confirmed!</h2>
      <p style="color: #3D2B1F; font-size: 16px;">Thank you for your order, ${order.shippingAddress.name}.</p>
      <p style="font-size: 14px; color: #666;">Order ID: ${order.razorpayOrderId}</p>
      
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <thead>
          <tr style="border-bottom: 2px solid #F5F0E8;">
            <th style="text-align: left; padding: 10px;">Item</th>
            <th style="text-align: center; padding: 10px;">Qty</th>
            <th style="text-align: right; padding: 10px;">Price</th>
          </tr>
        </thead>
        <tbody>
          ${order.items.map((item: any) => `
            <tr style="border-bottom: 1px solid #F5F0E8;">
              <td style="padding: 10px;">${item.name} (${item.size}/${item.color})</td>
              <td style="text-align: center; padding: 10px;">${item.quantity}</td>
              <td style="text-align: right; padding: 10px;">₹${item.price}</td>
            </tr>
          `).join('')}
        </tbody>
        <tfoot>
          <tr>
            <td colspan="2" style="text-align: right; padding: 10px; font-weight: bold;">Total</td>
            <td style="text-align: right; padding: 10px; font-weight: bold; color: #C9A84C;">₹${order.total}</td>
          </tr>
        </tfoot>
      </table>
      
      <p style="color: #3D2B1F; font-size: 14px;">Our artisans are now preparing your pieces. You'll receive another email when your order ships.</p>
    </div>
  `,
  staffInvite: (url: string) => `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #C9A84C; border-radius: 8px;">
      <h2 style="color: #C9A84C; text-align: center;">Join the Old Loom Team</h2>
      <p style="color: #3D2B1F; font-size: 16px;">You've been invited to join the Old Loom administration team.</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${url}" style="background: #C9A84C; color: #1A1612; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; text-transform: uppercase;">Accept Invitation</a>
      </div>
      <p style="color: #3D2B1F; font-size: 14px;">This invitation will expire in 48 hours.</p>
    </div>
  `,
};
