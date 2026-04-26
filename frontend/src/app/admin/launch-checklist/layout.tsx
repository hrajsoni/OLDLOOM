import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Launch Checklist' };

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
