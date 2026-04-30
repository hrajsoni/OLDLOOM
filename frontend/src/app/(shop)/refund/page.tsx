import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Refund Policy | Old Loom',
  description: 'Old Loom refund policy — eligibility, process, and timelines for refund requests.',
};

export default function RefundPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--dark)', paddingTop: '5rem' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: 'clamp(3rem,6vw,6rem) var(--section-px)' }}>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.6rem', letterSpacing: '0.25em', color: 'var(--gold)', textTransform: 'uppercase', marginBottom: '1rem' }}>Legal</p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.5rem,5vw,4rem)', fontWeight: 200, color: 'var(--cream)', letterSpacing: '-0.02em', marginBottom: '3rem' }}>
          Refund Policy
        </h1>

        <div style={{ background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.15)', borderRadius: 'var(--radius-md)', padding: '1.5rem 2rem', marginBottom: '3rem' }}>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: 'var(--gold)', marginBottom: '0.5rem' }}>Our Commitment</p>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.78rem', color: 'var(--cream-50)', lineHeight: 1.8 }}>
            We stand behind every garment we make. If you are not satisfied with your purchase for any eligible reason, we will make it right through a refund, exchange, or store credit.
          </p>
        </div>

        {[
          { title: 'Eligibility for Refund', body: 'Refunds are available for items returned within 7 days of delivery in original, unworn condition with all tags attached. Washed, worn, or damaged items are not eligible. Custom orders and flash sale items are exchange-only.' },
          { title: 'How to Request a Refund', body: 'Log into your account and navigate to "My Orders". Select the relevant order and click "Request Return/Refund". Fill in the reason and submit. Alternatively, email hello@oldloom.in with your order number.' },
          { title: 'Reverse Pickup', body: 'Once your return request is approved, we will schedule a free reverse pickup within 2 business days. Please ensure the item is packaged securely in the original packaging or similar protective material.' },
          { title: 'Processing Time', body: 'Once we receive your return and complete quality inspection (typically 2–3 business days), we will initiate the refund. Please allow 5–7 business days for the refund to reflect in your account.' },
          { title: 'Refund Method', body: 'Refunds are credited to the original payment method. UPI and card refunds typically take 3–5 working days after initiation. Net banking refunds may take up to 7 working days. If you prefer store credit, it will be added to your account within 24 hours of inspection.' },
          { title: 'Non-Refundable Situations', body: 'Refunds will not be issued for: items returned after 7 days, items that show signs of wear or washing, items without original tags, custom embroidery orders, or where the return does not match what was originally shipped.' },
          { title: 'Failed Payments', body: 'If your payment was deducted but the order was not confirmed, the amount will be automatically reversed within 5–7 business days. Contact hello@oldloom.in if it has been longer than 7 days.' },
        ].map((s) => (
          <div key={s.title} style={{ marginBottom: '2.5rem', paddingBottom: '2.5rem', borderBottom: '1px solid rgba(201,168,76,0.08)' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 300, color: 'var(--cream)', marginBottom: '0.75rem' }}>{s.title}</h2>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem', lineHeight: 1.9, color: 'var(--cream-50)' }}>{s.body}</p>
          </div>
        ))}

        <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.72rem', color: 'rgba(245,240,232,0.4)' }}>
          Questions? <a href="mailto:hello@oldloom.in" style={{ color: 'var(--gold)', textDecoration: 'none' }}>hello@oldloom.in</a>
        </p>
      </div>
    </div>
  );
}
