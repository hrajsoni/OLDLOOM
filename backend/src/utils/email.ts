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

const BRAND_COLORS = {
  bg: '#1A1612',
  gold: '#C9A84C',
  text: '#F5F0E8',
};

const commonStyles = `
  background-color: ${BRAND_COLORS.bg};
  color: ${BRAND_COLORS.text};
  font-family: 'Georgia', serif;
  padding: 40px;
  max-width: 600px;
  margin: 0 auto;
  border: 1px solid ${BRAND_COLORS.gold};
`;

export async function sendVerificationEmail(to: string, name: string, otp: string) {
  const html = `
    <div style="${commonStyles}">
      <h1 style="color: ${BRAND_COLORS.gold}; text-align: center;">Old Loom</h1>
      <h2 style="text-align: center;">Verify Your Account</h2>
      <p>Hello ${name},</p>
      <p>Welcome to Old Loom. Please use the following One-Time Password (OTP) to verify your email address:</p>
      <div style="background: #2A241E; padding: 20px; text-align: center; margin: 30px 0; border: 1px dashed ${BRAND_COLORS.gold};">
        <span style="font-family: 'Courier New', monospace; font-size: 32px; font-weight: bold; color: ${BRAND_COLORS.gold}; letter-spacing: 10px;">${otp}</span>
      </div>
      <p>This OTP will expire in 10 minutes.</p>
      <p style="font-size: 12px; color: #888; margin-top: 40px;">If you didn't request this, please ignore this email.</p>
    </div>
  `;

  await transporter.sendMail({
    from: `"Old Loom" <${process.env.SMTP_FROM || 'noreply@oldloom.in'}>`,
    to,
    subject: 'Verify your Old Loom account',
    html,
    text: `Your Old Loom verification code is: ${otp}`,
  });
}

export async function sendPasswordResetEmail(to: string, name: string, resetLink: string) {
  const html = `
    <div style="${commonStyles}">
      <h1 style="color: ${BRAND_COLORS.gold}; text-align: center;">Old Loom</h1>
      <h2 style="text-align: center;">Reset Your Password</h2>
      <p>Hello ${name},</p>
      <p>We received a request to reset your password. Click the button below to proceed:</p>
      <div style="text-align: center; margin: 40px 0;">
        <a href="${resetLink}" style="background: ${BRAND_COLORS.gold}; color: ${BRAND_COLORS.bg}; padding: 15px 30px; text-decoration: none; font-weight: bold; border-radius: 4px; text-transform: uppercase;">Reset Password</a>
      </div>
      <p>This link will expire in 1 hour.</p>
      <p>If the button doesn't work, copy and paste this link: ${resetLink}</p>
    </div>
  `;

  await transporter.sendMail({
    from: `"Old Loom" <${process.env.SMTP_FROM || 'noreply@oldloom.in'}>`,
    to,
    subject: 'Reset your Old Loom password',
    html,
  });
}

export async function sendOrderConfirmation(to: string, name: string, order: any) {
  const html = `
    <div style="${commonStyles}">
      <h1 style="color: ${BRAND_COLORS.gold}; text-align: center;">Old Loom</h1>
      <h2 style="text-align: center;">Order Confirmed</h2>
      <p>Hello ${name},</p>
      <p>Your order <strong>#${order.razorpayOrderId}</strong> has been placed successfully.</p>
      
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <thead>
          <tr style="border-bottom: 1px solid ${BRAND_COLORS.gold};">
            <th style="text-align: left; padding: 10px;">Item</th>
            <th style="text-align: center; padding: 10px;">Qty</th>
            <th style="text-align: right; padding: 10px;">Price</th>
          </tr>
        </thead>
        <tbody>
          ${order.items.map((item: any) => `
            <tr style="border-bottom: 1px solid #333;">
              <td style="padding: 10px;">${item.name}<br/><span style="font-size: 11px; color: #888;">${item.size} / ${item.color}</span></td>
              <td style="text-align: center; padding: 10px;">${item.quantity}</td>
              <td style="text-align: right; padding: 10px;">₹${item.price}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div style="text-align: right; margin-top: 20px;">
        <p>Subtotal: ₹${order.subtotal}</p>
        <p>Discount: -₹${order.discountAmount}</p>
        <p>Delivery: ₹${order.deliveryCharge}</p>
        <p>GST: ₹${order.gst || Math.round(order.total * 0.18)}</p>
        <h3 style="color: ${BRAND_COLORS.gold};">Total: ₹${order.total}</h3>
      </div>

      <div style="margin-top: 30px; border-top: 1px solid #333; padding-top: 20px;">
        <p><strong>Shipping To:</strong></p>
        <p>${order.shippingAddress.name}<br/>${order.shippingAddress.addressLine1}, ${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.pincode}</p>
      </div>
    </div>
  `;

  await transporter.sendMail({
    from: `"Old Loom" <${process.env.SMTP_FROM || 'noreply@oldloom.in'}>`,
    to,
    subject: `Order confirmed — Old Loom #${order.razorpayOrderId}`,
    html,
  });
}

export async function sendStaffInvitation(to: string, name: string, role: string, inviteLink: string) {
  const html = `
    <div style="${commonStyles}">
      <h1 style="color: ${BRAND_COLORS.gold}; text-align: center;">Old Loom</h1>
      <h2 style="text-align: center;">Team Invitation</h2>
      <p>Hello ${name},</p>
      <p>You've been invited to join Old Loom as a <strong>${role}</strong>.</p>
      <div style="text-align: center; margin: 40px 0;">
        <a href="${inviteLink}" style="background: ${BRAND_COLORS.gold}; color: ${BRAND_COLORS.bg}; padding: 15px 30px; text-decoration: none; font-weight: bold; border-radius: 4px; text-transform: uppercase;">Accept Invitation</a>
      </div>
    </div>
  `;

  await transporter.sendMail({
    from: `"Old Loom" <${process.env.SMTP_FROM || 'noreply@oldloom.in'}>`,
    to,
    subject: `You're invited to join Old Loom as ${role}`,
    html,
  });
}

export async function sendShippingUpdate(to: string, name: string, orderId: string, status: string, trackingNumber?: string) {
  const html = `
    <div style="${commonStyles}">
      <h1 style="color: ${BRAND_COLORS.gold}; text-align: center;">Old Loom</h1>
      <h2 style="text-align: center;">Shipping Update</h2>
      <p>Hello ${name},</p>
      <p>Your order <strong>#${orderId}</strong> status has been updated to: <strong>${status}</strong>.</p>
      ${trackingNumber ? `<p>Tracking Number: <strong>${trackingNumber}</strong></p>` : ''}
      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.CLIENT_URL}/account/orders" style="color: ${BRAND_COLORS.gold}; text-decoration: underline;">Track your order on Old Loom</a>
      </div>
    </div>
  `;

  await transporter.sendMail({
    from: `"Old Loom" <${process.env.SMTP_FROM || 'noreply@oldloom.in'}>`,
    to,
    subject: `Your Old Loom order has been ${status}`,
    html,
  });
}
