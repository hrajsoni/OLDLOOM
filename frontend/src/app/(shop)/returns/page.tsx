import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Returns & Exchanges | Old Loom',
  description: 'Old Loom return and exchange policy — 7-day returns, process, and eligibility criteria.',
};

export default function ReturnsPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--dark)', paddingTop: '5rem' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: 'clamp(3rem,6vw,6rem) var(--section-px)' }}>

        <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.6rem', letterSpacing: '0.25em', color: 'var(--gold)', textTransform: 'uppercase', marginBottom: '1rem' }}>
          Policies
        </p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.5rem,5vw,4rem)', fontWeight: 200, color: 'var(--cream)', letterSpacing: '-0.02em', marginBottom: '3rem' }}>
          Returns & Exchanges
        </h1>

        {/* Eligibility banner */}
        <div style={{
          background: 'rgba(201,168,76,0.06)',
          border: '1px solid rgba(201,168,76,0.2)',
          borderRadius: 'var(--radius-md)',
          padding: '1.5rem 2rem',
          marginBottom: '3rem',
        }}>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: 'var(--gold)', marginBottom: '0.5rem' }}>
            7-Day Return Window
          </p>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.78rem', color: 'var(--cream-50)', lineHeight: 1.8 }}>
            We accept returns within 7 days of delivery. Items must be unworn, unwashed, with all original tags attached and packaging intact.
          </p>
        </div>

        {[
          {
            title: 'What Can Be Returned',
            body: 'Any item in its original condition — unworn, unwashed, unaltered, with all tags attached — can be returned within 7 days of delivery. Items purchased during sale events are eligible for exchange only, not refund.',
          },
          {
            title: 'What Cannot Be Returned',
            body: 'Washed or worn garments, items without original tags, custom embroidery orders, intimates, accessories, and items purchased during flash sales (50%+ off) cannot be returned.',
          },
          {
            title: 'How to Initiate a Return',
            body: 'Log into your account, go to "My Orders", select the order and click "Request Return". Alternatively, email hello@oldloom.in with your order number and reason. We will arrange a free reverse pickup within 2 business days.',
          },
          {
            title: 'Refund Timeline',
            body: 'Once we receive and inspect your return (2–3 days), we will initiate a refund to your original payment method within 5–7 business days. For UPI and card payments, the refund reflects in 3–5 working days after initiation.',
          },
          {
            title: 'Exchanges',
            body: 'Want a different size or colour? Select "Exchange" when initiating your return request. We will ship the replacement at no additional charge once we receive your return. Exchange requests are processed within 1 business day.',
          },
          {
            title: 'Damaged or Wrong Items',
            body: 'If you received a damaged item or the wrong product, please contact us within 48 hours of delivery with photos. We will arrange an immediate replacement or full refund at no cost to you.',
          },
        ].map((section) => (
          <div key={section.title} style={{ marginBottom: '2.5rem', paddingBottom: '2.5rem', borderBottom: '1px solid rgba(201,168,76,0.08)' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 300, color: 'var(--cream)', marginBottom: '0.75rem' }}>
              {section.title}
            </h2>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem', lineHeight: 1.9, color: 'var(--cream-50)' }}>
              {section.body}
            </p>
          </div>
        ))}

        <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.72rem', color: 'rgba(245,240,232,0.4)' }}>
          Need help?{' '}
          <a href="mailto:hello@oldloom.in" style={{ color: 'var(--gold)', textDecoration: 'none' }}>hello@oldloom.in</a>
        </p>
      </div>
    </div>
  );
}
