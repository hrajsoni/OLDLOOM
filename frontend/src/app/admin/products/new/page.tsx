import type { Metadata } from 'next';
import { ProductForm } from '@/components/admin/ProductForm';

export const metadata: Metadata = { title: 'New Product' };

export default function NewProductPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#F5F0E8] font-mono">New Product</h1>
        <p className="text-[#F5F0E8]/40 text-sm font-mono mt-1">
          Create a new product listing
        </p>
      </div>
      <ProductForm />
    </div>
  );
}
