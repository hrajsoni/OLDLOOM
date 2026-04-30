import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Shipping & Delivery | Old Loom',
  description: 'Old Loom shipping policy — delivery timelines, charges, and tracking information across India.',
};

export default function ShippingPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--dark)', paddingTop: '5rem' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: 'clamp(3rem,6vw,6rem) var(--section-px)' }}>

        <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.6rem', letterSpacing: '0.25em', color: 'var(--gold)', textTransform: 'uppercase', marginBottom: '1rem' }}>
          Policies
        </p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.5rem,5vw,4rem)', fontWeight: 200, color: 'var(--cream)', letterSpacing: '-0.02em', marginBottom: '3rem' }}>
          Shipping & Delivery
        </h1>

        {[
          {
            title: 'Processing Time',
            body: 'Orders are processed within 1–2 business days. Since each garment is handcrafted, some pieces may require an additional 1–2 days for quality inspection. You will receive an email with your tracking number once your order has been dispatched.',
          },
          {
            title: 'Delivery Timeline',
            body: 'Standard delivery across India typically takes 3–5 business days from dispatch. Remote areas may take an additional 2–3 days. Express delivery (1–2 days) is available at checkout for select pincodes at an additional charge of ₹149.',
          },
          {
            title: 'Shipping Charges',
            body: 'Free shipping on all orders above ₹5,000. Orders below ₹5,000 incur a flat shipping charge of ₹79. Express shipping is available for ₹149 regardless of order value.',
          },
          {
            title: 'Order Tracking',
            body: 'Once your order is dispatched, you will receive an SMS and email with your tracking link. You can also track your order from the "My Orders" section in your account. We ship via Shiprocket with partners like Delhivery, BlueDart, and Ekart.',
          },
          {
            title: 'International Shipping',
            body: 'We currently ship only within India. International shipping is planned for Q3 2025. Join our newsletter to be notified when we expand.',
          },
          {
            title: 'Damaged in Transit',
            body: 'If your order arrives damaged, please photograph the package and product within 24 hours of delivery and email us at hello@oldloom.in. We will arrange a replacement or refund promptly.',
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

        <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.72rem', color: 'rgba(245,240,232,0.4)', marginTop: '1rem' }}>
          Questions? Contact us at{' '}
          <a href="mailto:hello@oldloom.in" style={{ color: 'var(--gold)', textDecoration: 'none' }}>hello@oldloom.in</a>
        </p>
      </div>
    </div>
  );
}
