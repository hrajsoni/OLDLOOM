import type { Metadata } from 'next';
import { CheckoutClient } from '@/components/CheckoutClient';

export const metadata: Metadata = {
  title: 'Checkout | Old Loom',
  description: 'Complete your purchase securely.',
};

export default function CheckoutPage() {
  return <CheckoutClient />;
}
