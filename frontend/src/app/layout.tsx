import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/components/providers/Providers';
import { MobileBottomNav } from '@/components/ui/MobileBottomNav';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXTAUTH_URL || 'http://localhost:3000'),
  title: {
    default: 'Old Loom — Embroidery Clothing | Est. 2025',
    template: '%s | Old Loom',
  },
  description:
    'Old Loom — Premium hand-embroidered clothing from India. Shop men, women & couples collections. Crafted threads, embroidered stories.',
  keywords: ['embroidery clothing', 'hand embroidered', 'Indian fashion', 'Old Loom', 'kurta', 'ethnic wear'],
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    siteName: 'Old Loom',
    title: 'Old Loom — Embroidery Clothing | Est. 2025',
    description: 'Premium hand-embroidered clothing from India. Crafted threads, embroidered stories.',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'Old Loom' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Old Loom — Embroidery Clothing',
    description: 'Premium hand-embroidered clothing from India.',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,600&family=DM+Mono:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Syne:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body suppressHydrationWarning>
        <Providers>
          {children}
          <MobileBottomNav />
        </Providers>
      </body>
    </html>
  );
}
