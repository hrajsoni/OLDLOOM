import type { Metadata } from 'next';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { AdminShell } from '@/components/admin/AdminShell';

export const metadata: Metadata = {
  title: { default: 'Admin — Old Loom', template: '%s | Admin' },
  robots: { index: false, follow: false },
};

const ADMIN_ROLES = ['super_admin', 'manager', 'content_editor', 'support_staff'];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect('/login?callbackUrl=/admin');
  }

  const role = (session.user as any).role;
  if (!ADMIN_ROLES.includes(role)) {
    redirect('/?error=unauthorized');
  }

  return <AdminShell user={session.user as any}>{children}</AdminShell>;
}
