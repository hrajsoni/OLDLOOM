import type { Metadata } from 'next';
import { AccountClient } from '@/components/AccountClient';

export const metadata: Metadata = {
  title: 'My Account | Old Loom',
  description: 'Manage your Old Loom account — orders, wishlist, addresses, and profile.',
};

export default function AccountPage() {
  // Auth guard is handled client-side in AccountClient via useSession
  // to avoid server-side session mismatches in deployed environments
  return <AccountClient user={null} />;
}
