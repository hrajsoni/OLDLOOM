import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service | Old Loom',
  description: 'Old Loom Terms of Service — the rules and guidelines for using our website and services.',
};

export default function TermsPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--dark)', paddingTop: '5rem' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: 'clamp(3rem,6vw,6rem) var(--section-px)' }}>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.6rem', letterSpacing: '0.25em', color: 'var(--gold)', textTransform: 'uppercase', marginBottom: '1rem' }}>Legal</p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.5rem,5vw,4rem)', fontWeight: 200, color: 'var(--cream)', letterSpacing: '-0.02em', marginBottom: '0.75rem' }}>
          Terms of Service
        </h1>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.7rem', color: 'rgba(245,240,232,0.3)', marginBottom: '3rem' }}>Last updated: May 1, 2025</p>

        {[
          { title: '1. Acceptance of Terms', body: 'By accessing and using the Old Loom website and services, you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.' },
          { title: '2. Products and Pricing', body: 'All prices are displayed in Indian Rupees (₹) and are inclusive of applicable taxes. We reserve the right to change prices at any time without notice. Product descriptions are accurate to the best of our ability; slight variations in colour may occur due to photographic lighting.' },
          { title: '3. Order Acceptance', body: 'Receipt of an order confirmation email does not constitute acceptance of your order. We reserve the right to cancel any order due to pricing errors, stock unavailability, or suspected fraud. In such cases, we will provide a full refund.' },
          { title: '4. Payment', body: 'We accept major credit and debit cards, UPI, and net banking via Razorpay. All transactions are encrypted and PCI DSS compliant. We do not store payment card information on our servers.' },
          { title: '5. Intellectual Property', body: 'All content on this website — including text, graphics, logos, product images, and embroidery designs — is the property of Old Loom and protected by Indian and international copyright law. You may not reproduce, distribute, or create derivative works without express written permission.' },
          { title: '6. User Accounts', body: 'You are responsible for maintaining the confidentiality of your account credentials. You agree to notify us immediately of any unauthorized use of your account. We are not liable for losses resulting from unauthorized use of your account.' },
          { title: '7. Limitation of Liability', body: 'Old Loom shall not be liable for any indirect, incidental, or consequential damages arising from your use of our website or products. Our total liability shall not exceed the amount paid for the specific product in dispute.' },
          { title: '8. Governing Law', body: 'These Terms of Service are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts in [City], India.' },
        ].map((s) => (
          <div key={s.title} style={{ marginBottom: '2.5rem', paddingBottom: '2.5rem', borderBottom: '1px solid rgba(201,168,76,0.08)' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 300, color: 'var(--cream)', marginBottom: '0.75rem' }}>{s.title}</h2>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem', lineHeight: 1.9, color: 'var(--cream-50)' }}>{s.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
