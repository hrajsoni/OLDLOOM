'use client';

import { useState } from 'react';
import { Check, Circle, ChevronDown, ChevronUp } from 'lucide-react';

interface ChecklistItem {
  id: string;
  category: string;
  label: string;
  description: string;
  critical: boolean;
}

const CHECKLIST: ChecklistItem[] = [
  // Security
  { id: 's1', category: 'Security', label: 'JWT access tokens expire in 15 minutes', description: 'Verify JWT_ACCESS_SECRET is set and expiry is 15m in auth controller.', critical: true },
  { id: 's2', category: 'Security', label: 'HTTP-only refresh token cookies set', description: 'Confirm cookie has httpOnly: true, secure: true, sameSite: strict in production.', critical: true },
  { id: 's3', category: 'Security', label: 'All admin routes protected by RBAC middleware', description: 'Every /admin/* route uses protect + requireRole + checkPermission.', critical: true },
  { id: 's4', category: 'Security', label: 'Razorpay webhook signature verified', description: 'HMAC-SHA256 verification in webhook.controller.ts before processing orders.', critical: true },
  { id: 's5', category: 'Security', label: 'Rate limiting on auth endpoints', description: 'Max 10 attempts per 15min on /auth/login, /auth/register, /auth/forgot-password.', critical: true },
  { id: 's6', category: 'Security', label: 'MongoDB Atlas IP whitelist configured', description: 'Add your Render server IP and local IP to Atlas Network Access.', critical: true },
  { id: 's7', category: 'Security', label: 'Environment variables not committed to git', description: 'Check .gitignore includes .env, .env.local, .env.production.', critical: true },
  { id: 's8', category: 'Security', label: 'CORS whitelist set to production domains only', description: 'CLIENT_URL and ADMIN_URL in .env point to production URLs, no wildcards.', critical: true },
  { id: 's9', category: 'Security', label: 'bcrypt salt rounds set to 12', description: 'Verify bcrypt(12) in User model pre-save hook.', critical: false },
  { id: 's10', category: 'Security', label: 'NoSQL injection prevention active', description: 'express-mongo-sanitize() middleware is mounted in app.ts.', critical: false },

  // Performance
  { id: 'p1', category: 'Performance', label: 'All R3F/Three.js components dynamically imported', description: 'Every component using Canvas is wrapped with dynamic(() => import(...), { ssr: false }).', critical: true },
  { id: 'p2', category: 'Performance', label: 'GLB models Draco compressed', description: 'Run models through gltf-pipeline -i model.glb -o model-draco.glb --draco.compressMeshes.', critical: false },
  { id: 'p3', category: 'Performance', label: 'All images using next/image', description: 'No raw <img> tags — all use Next.js Image component with proper sizes prop.', critical: true },
  { id: 'p4', category: 'Performance', label: 'prefers-reduced-motion respected', description: 'useReducedMotion() hook disables all GSAP + R3F animations when true.', critical: false },
  { id: 'p5', category: 'Performance', label: 'Adaptive GPU quality enabled', description: 'useGPUTier() hook disables postprocessing on tier < 2 devices.', critical: false },
  { id: 'p6', category: 'Performance', label: 'Lighthouse score 90+ on all metrics', description: 'Run Lighthouse in Chrome DevTools on production URL. Fix all red items.', critical: true },
  { id: 'p7', category: 'Performance', label: 'Lenis + GSAP only init client-side', description: 'All animation code wrapped in typeof window !== "undefined" or useEffect.', critical: false },
  { id: 'p8', category: 'Performance', label: 'Bundle size checked — no chunk over 200kb', description: 'Run ANALYZE=true next build and inspect the bundle report.', critical: false },

  // SEO
  { id: 'seo1', category: 'SEO', label: 'generateMetadata() on all pages', description: 'Homepage, collections, product pages, account pages all have proper metadata.', critical: true },
  { id: 'seo2', category: 'SEO', label: 'Product JSON-LD structured data', description: 'Product schema with price, availability, image, aggregateRating on /products/[slug].', critical: true },
  { id: 'seo3', category: 'SEO', label: 'XML sitemap generates correctly', description: 'Visit /sitemap.xml on production — verify all product slugs are listed.', critical: true },
  { id: 'seo4', category: 'SEO', label: 'robots.txt disallows /admin and /api', description: 'Visit /robots.txt — confirm admin and API paths are disallowed.', critical: true },
  { id: 'seo5', category: 'SEO', label: 'OG images set for all pages', description: 'Check og:image meta tag is present on homepage and product pages.', critical: false },
  { id: 'seo6', category: 'SEO', label: 'Canonical URLs on all pages', description: 'No duplicate content — canonical tag points to the correct URL.', critical: false },
  { id: 'seo7', category: 'SEO', label: 'Google Search Console submitted', description: 'Submit sitemap.xml in Google Search Console after going live.', critical: false },

  // Payments
  { id: 'pay1', category: 'Payments', label: 'Razorpay keys switched to live mode', description: 'Replace test keys with live RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in Render env vars.', critical: true },
  { id: 'pay2', category: 'Payments', label: 'Webhook URL registered in Razorpay dashboard', description: 'Add https://your-api.onrender.com/api/v1/orders/webhook in Razorpay settings.', critical: true },
  { id: 'pay3', category: 'Payments', label: 'Payment verified server-side before order creation', description: 'Orders only created after HMAC-SHA256 verification passes in verify-payment route.', critical: true },
  { id: 'pay4', category: 'Payments', label: 'Test payment flow end-to-end', description: 'Complete a full checkout with Razorpay test mode — verify order appears in admin.', critical: true },
  { id: 'pay5', category: 'Payments', label: 'Refund flow tested', description: 'Initiate a refund from admin panel — verify it reflects in Razorpay dashboard.', critical: false },

  // Email
  { id: 'em1', category: 'Email', label: 'SMTP credentials configured', description: 'SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM set in Render env vars.', critical: true },
  { id: 'em2', category: 'Email', label: 'Order confirmation email tested', description: 'Place a test order — verify confirmation email arrives with correct details.', critical: true },
  { id: 'em3', category: 'Email', label: 'Staff invite email tested', description: 'Invite a staff member — verify invite email arrives with working link.', critical: false },
  { id: 'em4', category: 'Email', label: 'Forgot password email tested', description: 'Use forgot password flow — verify reset link arrives and works.', critical: false },

  // Infrastructure
  { id: 'inf1', category: 'Infrastructure', label: 'Custom domain configured on Vercel', description: 'Add your domain in Vercel project settings and update DNS records.', critical: true },
  { id: 'inf2', category: 'Infrastructure', label: 'Backend deployed on Render with health check', description: 'GET /api/v1/health returns 200. Render uses this for uptime monitoring.', critical: true },
  { id: 'inf3', category: 'Infrastructure', label: 'NEXTAUTH_URL set to production URL', description: 'NEXTAUTH_URL=https://oldloom.in in Vercel environment variables.', critical: true },
  { id: 'inf4', category: 'Infrastructure', label: 'MongoDB Atlas cluster tier reviewed', description: 'Free tier (M0) is fine for launch. Upgrade to M10 when traffic grows.', critical: false },
  { id: 'inf5', category: 'Infrastructure', label: 'Vercel Analytics enabled', description: 'Enable Speed Insights and Web Analytics in Vercel project dashboard.', critical: false },

  // Legal
  { id: 'leg1', category: 'Legal', label: 'Privacy Policy page created', description: 'Create /privacy page with data collection, usage, and cookie policy.', critical: true },
  { id: 'leg2', category: 'Legal', label: 'Terms & Conditions page created', description: 'Create /terms page with purchase terms, IP rights, dispute resolution.', critical: true },
  { id: 'leg3', category: 'Legal', label: 'Refund & Return Policy page created', description: 'Create /refund-policy page — required by Razorpay and consumer law.', critical: true },
  { id: 'leg4', category: 'Legal', label: 'GST registration number displayed', description: 'Show GSTIN on invoices and footer if registered.', critical: false },
  { id: 'leg5', category: 'Legal', label: 'Shipping policy page created', description: 'Create /shipping-policy with delivery timelines and carriers.', critical: false },
];

const CATEGORIES = ['Security', 'Performance', 'SEO', 'Payments', 'Email', 'Infrastructure', 'Legal'];

const CATEGORY_COLORS: Record<string, string> = {
  Security: 'bg-red-500/10 text-red-400 border-red-500/20',
  Performance: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
  SEO: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
  Payments: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  Email: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  Infrastructure: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  Legal: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
};

export default function LaunchChecklistPage() {
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [expanded, setExpanded] = useState<Set<string>>(new Set(CATEGORIES));
  const [filterCategory, setFilterCategory] = useState('');
  const [showCriticalOnly, setShowCriticalOnly] = useState(false);

  const toggle = (id: string) => {
    setChecked((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleCategory = (cat: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(cat) ? next.delete(cat) : next.add(cat);
      return next;
    });
  };

  const filteredItems = CHECKLIST.filter((item) => {
    if (filterCategory && item.category !== filterCategory) return false;
    if (showCriticalOnly && !item.critical) return false;
    return true;
  });

  const totalItems = CHECKLIST.length;
  const checkedCount = checked.size;
  const criticalItems = CHECKLIST.filter((i) => i.critical);
  const criticalChecked = criticalItems.filter((i) => checked.has(i.id)).length;
  const progressPercent = Math.round((checkedCount / totalItems) * 100);

  const categoriesInFilter = filterCategory ? [filterCategory] : CATEGORIES;

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#F5F0E8] font-mono">Launch Checklist</h1>
        <p className="text-[#F5F0E8]/40 text-sm font-mono mt-1">
          {checkedCount} / {totalItems} complete · {criticalChecked} / {criticalItems.length} critical
        </p>
      </div>

      {/* Progress */}
      <div className="bg-[#1A1612] border border-[#C9A84C]/10 rounded-xl p-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-mono text-[#F5F0E8]/60">Overall Progress</span>
          <span className="text-2xl font-bold font-mono text-[#C9A84C]">{progressPercent}%</span>
        </div>
        <div className="h-2 bg-[#F5F0E8]/5 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#C9A84C] to-[#B5451B] rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        {progressPercent === 100 && (
          <p className="text-emerald-400 font-mono text-sm mt-3 text-center">
            🚀 All items complete — you're ready to launch!
          </p>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setFilterCategory('')}
            className={`text-xs px-3 py-1.5 rounded-full font-mono border transition-colors ${
              !filterCategory
                ? 'bg-[#C9A84C]/20 text-[#C9A84C] border-[#C9A84C]/30'
                : 'border-[#F5F0E8]/10 text-[#F5F0E8]/40 hover:text-[#F5F0E8]'
            }`}
          >
            All
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat === filterCategory ? '' : cat)}
              className={`text-xs px-3 py-1.5 rounded-full font-mono border transition-colors ${
                filterCategory === cat
                  ? CATEGORY_COLORS[cat]
                  : 'border-[#F5F0E8]/10 text-[#F5F0E8]/40 hover:text-[#F5F0E8]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        <label className="flex items-center gap-2 cursor-pointer ml-auto">
          <input
            type="checkbox"
            checked={showCriticalOnly}
            onChange={(e) => setShowCriticalOnly(e.target.checked)}
            className="accent-[#B5451B] w-4 h-4"
          />
          <span className="text-xs text-[#F5F0E8]/50 font-mono">Critical only</span>
        </label>
      </div>

      {/* Checklist */}
      <div className="space-y-4">
        {categoriesInFilter.map((category) => {
          const items = filteredItems.filter((i) => i.category === category);
          if (!items.length) return null;

          const categoryChecked = items.filter((i) => checked.has(i.id)).length;
          const isExpanded = expanded.has(category);

          return (
            <div key={category} className="bg-[#1A1612] border border-[#C9A84C]/10 rounded-xl overflow-hidden">
              {/* Category header */}
              <button
                onClick={() => toggleCategory(category)}
                className="w-full flex items-center justify-between px-5 py-4 hover:bg-[#F5F0E8]/2 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-mono border ${CATEGORY_COLORS[category]}`}>
                    {category}
                  </span>
                  <span className="text-xs text-[#F5F0E8]/40 font-mono">
                    {categoryChecked} / {items.length}
                  </span>
                </div>
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4 text-[#F5F0E8]/30" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-[#F5F0E8]/30" />
                )}
              </button>

              {/* Items */}
              {isExpanded && (
                <div className="divide-y divide-[#F5F0E8]/5 border-t border-[#C9A84C]/10">
                  {items.map((item) => {
                    const isDone = checked.has(item.id);
                    return (
                      <div
                        key={item.id}
                        onClick={() => toggle(item.id)}
                        className={`flex items-start gap-4 px-5 py-4 cursor-pointer transition-colors ${
                          isDone ? 'bg-emerald-500/5' : 'hover:bg-[#F5F0E8]/2'
                        }`}
                      >
                        {/* Checkbox */}
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${
                          isDone
                            ? 'bg-emerald-500 border-emerald-500'
                            : 'border-[#F5F0E8]/20 hover:border-[#C9A84C]/50'
                        }`}>
                          {isDone && <Check className="w-3 h-3 text-white" />}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className={`text-sm font-medium transition-colors ${isDone ? 'text-[#F5F0E8]/40 line-through' : 'text-[#F5F0E8]/90'}`}>
                              {item.label}
                            </p>
                            {item.critical && !isDone && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#B5451B]/20 text-[#B5451B] font-mono border border-[#B5451B]/20">
                                CRITICAL
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-[#F5F0E8]/30 font-mono mt-1 leading-relaxed">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom actions */}
      <div className="bg-[#1A1612] border border-[#C9A84C]/10 rounded-xl p-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm text-[#F5F0E8]/60 font-mono">
            {totalItems - checkedCount} items remaining
          </p>
          <p className="text-xs text-[#F5F0E8]/25 font-mono mt-0.5">
            Progress is stored in this browser session
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setChecked(new Set(CHECKLIST.map((i) => i.id)))}
            className="text-xs px-4 py-2 rounded-lg border border-emerald-500/30 text-emerald-400 font-mono hover:bg-emerald-500/10 transition-colors"
          >
            Mark All Done
          </button>
          <button
            onClick={() => setChecked(new Set())}
            className="text-xs px-4 py-2 rounded-lg border border-[#F5F0E8]/10 text-[#F5F0E8]/40 font-mono hover:text-[#F5F0E8] transition-colors"
          >
            Reset All
          </button>
        </div>
      </div>
    </div>
  );
}
