# 🧵 Old Loom — Premium Embroidery E-Commerce

> A production-grade e-commerce platform for a premium Indian hand-embroidered clothing brand. Features immersive 3D product visualization, role-based admin panel, integrated payments, and serverless deployment.

🌐 **Live Demo**: [oldloom.in](https://oldloom.in) *(replace with your URL)*  
📸 **Screenshots**: See `/docs/screenshots`

---

## ✨ Features

### Customer Experience
- 🛍️ Product catalog with collections (Men, Women, Couples)
- 🎨 Interactive 3D product viewer with custom GLSL shaders (Three.js)
- ⚡ Smooth-scroll animations (Lenis + GSAP)
- 🛒 Persistent cart with Zustand
- 💳 Razorpay payment integration with webhook verification
- 📦 Order tracking with visual timeline
- 👤 User accounts with multiple addresses & wishlist
- 📧 Transactional emails (verification, password reset, order confirmation)
- 📱 Mobile-first responsive with bottom navigation
- ♿ Accessibility: reduced motion support, semantic HTML

### Admin Panel
- 🔐 Role-based access control (4 admin roles)
- 📊 Analytics dashboard with revenue charts
- 📦 Product CRUD with bulk operations
- 📋 Order management with status updates & refunds
- 👥 Customer insights with order history
- 🎟️ Coupon system (percent & flat discounts)
- 📈 Inventory tracking with low-stock alerts
- 📜 Immutable audit log of all admin actions
- 📤 CSV export for orders
- ✉️ Staff invitation system with token-based onboarding

### Engineering
- 🔒 Production-grade security (CSP, HSTS, helmet, rate limiting)
- 🚀 Server-side rendering + ISR for SEO
- 🎯 GPU-tier detection for graceful 3D degradation
- 📝 Centralized error handling & Winston logging
- 🔄 JWT refresh token rotation
- ✅ Zod validation on all inputs (client + server)
- 🤖 GitHub Actions CI pipeline

---

## 🛠️ Tech Stack

**Frontend**: Next.js 14 (App Router) · TypeScript · Tailwind CSS · React Three Fiber · GSAP · Lenis · Zustand · TanStack Query · NextAuth.js · React Hook Form · Zod

**Backend**: Node.js · Express · TypeScript · MongoDB (Mongoose) · JWT · Bcrypt · Razorpay · Nodemailer · Winston · Zod

**Infrastructure**: Vercel · Render · MongoDB Atlas · Cloudinary · GitHub Actions

---

## 🏗️ Architecture

```
┌─────────────┐      ┌──────────────┐      ┌──────────────┐
│   Next.js   │─────▶│  Express API │─────▶│   MongoDB    │
│  (Vercel)   │      │   (Render)   │      │    Atlas     │
└─────────────┘      └──────────────┘      └──────────────┘
       │                     │
       ▼                     ▼
┌─────────────┐      ┌──────────────┐
│  Cloudinary │      │   Razorpay   │
│   (Media)   │      │  (Payments)  │
└─────────────┘      └──────────────┘
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- MongoDB Atlas account
- Razorpay account (test mode)
- Cloudinary account
- SMTP credentials (Gmail App Password works)

### Installation

```bash
# Clone repo
git clone https://github.com/hrajsoni/OLDLOOM.git
cd OLDLOOM

# Backend setup
cd backend
npm install
cp .env.example .env  # Fill in your credentials
npm run seed          # Seeds DB with demo data
npm run dev           # Starts on port 5000

# Frontend setup (new terminal)
cd ../frontend
npm install
cp .env.example .env.local  # Fill in your credentials
npm run dev           # Starts on port 3000
```

### Demo Accounts (after seeding)

| Role | Email | Password |
|------|-------|----------|
| Super Admin | admin@oldloom.in | OldLoom@Admin2025 |
| Manager | manager@oldloom.in | OldLoom@Mgr2025 |
| Customer | customer@oldloom.in | OldLoom@Cust2025 |

Admin panel: navigate to `/admin/login`

---

## 📂 Project Structure

```
OLDLOOM/
├── frontend/          # Next.js app
│   ├── src/app/       # App Router pages
│   ├── src/components # React components
│   └── src/...        # hooks, stores, types, lib
├── backend/           # Express API
│   ├── src/models/    # Mongoose schemas
│   ├── src/controllers/
│   ├── src/routes/
│   └── src/...        # middleware, utils, config
└── .github/workflows/ # CI pipeline
```

---

## 🔐 Security Highlights

- **Password hashing**: bcrypt with 12 salt rounds
- **JWT rotation**: refresh tokens rotated on every refresh
- **HTTP-only cookies** for refresh tokens
- **CSP headers** with strict source directives
- **HSTS** with preload
- **Rate limiting**: 10 req/15min on auth endpoints
- **HMAC verification** for Razorpay webhooks
- **NoSQL injection prevention** via mongo-sanitize
- **HTTP parameter pollution** prevention via hpp
- **Audit logging** of all admin actions with IP + user agent

---

## 📜 License

MIT © Harshit Raj Soni

---

## 🙋 About

Built with 🧵 by [Harshit Raj Soni](https://github.com/hrajsoni)
