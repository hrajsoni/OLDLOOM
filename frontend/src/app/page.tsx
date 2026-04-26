import type { Metadata } from 'next';
import { HomeClient } from '@/components/HomeClient';

export const metadata: Metadata = {
  title: 'Old Loom — Wear the Craft',
  description:
    'Premium hand-embroidered clothing from India — men, women & couples collections. Crafted threads. Embroidered stories.',
};

export default function HomePage() {
  return <HomeClient />;
}
