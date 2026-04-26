'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import api from '@/lib/api';
import { ProductForm } from '@/components/admin/ProductForm';

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-product', id],
    queryFn: () => api.get(`/admin/products/${id}`).then((r) => r.data.data),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-24 bg-[#1A1612] rounded-xl animate-pulse border border-[#C9A84C]/10" />
        ))}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-20 text-[#F5F0E8]/40 font-mono">
        Product not found
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#F5F0E8] font-mono">Edit Product</h1>
        <p className="text-[#F5F0E8]/40 text-sm font-mono mt-1 truncate">
          {data.name}
        </p>
      </div>
      <ProductForm productId={id} defaultValues={data} />
    </div>
  );
}
