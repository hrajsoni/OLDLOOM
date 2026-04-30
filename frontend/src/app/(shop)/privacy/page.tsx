import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | Old Loom',
  description: 'Old Loom Privacy Policy — how we collect, use, and protect your personal information.',
};

export default function PrivacyPage() {
  const lastUpdated = 'May 1, 2025';
  return (
    <div style={{ minHeight: '100vh', background: 'var(--dark)', paddingTop: '5rem' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: 'clamp(3rem,6vw,6rem) var(--section-px)' }}>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.6rem', letterSpacing: '0.25em', color: 'var(--gold)', textTransform: 'uppercase', marginBottom: '1rem' }}>
          Legal
        </p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.5rem,5vw,4rem)', fontWeight: 200, color: 'var(--cream)', letterSpacing: '-0.02em', marginBottom: '0.75rem' }}>
          Privacy Policy
        </h1>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.7rem', color: 'rgba(245,240,232,0.3)', marginBottom: '3rem' }}>
          Last updated: {lastUpdated}
        </p>

        {[
          { title: '1. Information We Collect', body: 'We collect information you provide directly to us, such as your name, email address, shipping address, and payment information. We also collect information automatically when you use our website, including browsing data, device information, and cookies.' },
          { title: '2. How We Use Your Information', body: 'We use your information to process orders and payments, send transactional emails (order confirmations, shipping updates), improve our products and website, send marketing communications (only with your consent), and comply with legal obligations.' },
          { title: '3. Payment Security', body: 'We do not store your complete credit card information. All payments are processed securely by Razorpay, which is PCI DSS compliant. We only receive a confirmation of successful payment and a masked card number.' },
          { title: '4. Data Sharing', body: 'We do not sell your personal information. We share data only with service providers necessary to fulfill orders (shipping partners, payment processors) and only to the extent required. We may disclose data when required by law.' },
          { title: '5. Cookies', body: 'We use essential cookies for authentication and cart functionality, and analytics cookies to understand usage patterns. You can disable non-essential cookies through your browser settings. Disabling essential cookies may impact site functionality.' },
          { title: '6. Data Retention', body: 'We retain your personal data for as long as your account is active or as needed to provide services. You may request deletion of your account and associated data by emailing privacy@oldloom.in.' },
          { title: '7. Your Rights', body: 'You have the right to access, correct, or delete your personal information. You may also opt out of marketing communications at any time by clicking "Unsubscribe" in any email or by contacting us.' },
          { title: '8. Contact', body: 'For privacy-related queries, contact our Data Protection Officer at privacy@oldloom.in or write to: Old Loom, [Registered Address], India.' },
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
