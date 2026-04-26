'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import Image from 'next/image';
import api from '@/lib/api';
import { usePermission, Permission } from '@/hooks/usePermission';
import { Plus, Search, Edit, Trash2, Eye, EyeOff, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

interface Product {
  _id: string;
  name: string;
  slug: string;
  category: string;
  subCategory: string;
  price: number;
  comparePrice?: number;
  images: string[];
  isPublished: boolean;
  isFeatured: boolean;
  totalSold: number;
  variants: { stock: number }[];
}

export default function AdminProductsPage() {
  const qc = useQueryClient();
  const canDelete = usePermission(Permission.DELETE_PRODUCTS);
  const canManage = usePermission(Permission.MANAGE_PRODUCTS);

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [publishFilter, setPublishFilter] = useState('');
  const [selected, setSelected] = useState<string[]>([]);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-products', page, search, category, publishFilter],
    queryFn: () =>
      api.get('/admin/products', {
        params: { page, limit: 20, search: search || undefined, category: category || undefined, isPublished: publishFilter || undefined },
      }).then((r) => r.data),
  });

  const products: Product[] = data?.data ?? [];
  const pagination = data?.pagination;

  const bulkMutation = useMutation({
    mutationFn: (payload: { ids: string[]; action: string }) =>
      api.patch('/admin/products/bulk', payload),
    onSuccess: (_, vars) => {
      toast.success(`Bulk ${vars.action} done`);
      setSelected([]);
      qc.invalidateQueries({ queryKey: ['admin-products'] });
    },
    onError: () => toast.error('Bulk action failed'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/products/${id}`),
    onSuccess: () => {
      toast.success('Product deleted');
      qc.invalidateQueries({ queryKey: ['admin-products'] });
    },
    onError: () => toast.error('Delete failed'),
  });

  const toggleAll = () => {
    setSelected(selected.length === products.length ? [] : products.map((p) => p._id));
  };

  const totalStock = (p: Product) => p.variants.reduce((a, v) => a + v.stock, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#F5F0E8] font-mono">Products</h1>
          <p className="text-[#F5F0E8]/40 text-sm font-mono mt-1">{pagination?.total ?? 0} products total</p>
        </div>
        {canManage && (
          <Link
            href="/admin/products/new"
            className="flex items-center gap-2 bg-[#C9A84C] text-[#1A1612] px-4 py-2 rounded-lg text-sm font-bold font-mono hover:bg-[#C9A84C]/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Product
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#F5F0E8]/30" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search products..."
            className="w-full bg-[#1A1612] border border-[#C9A84C]/10 rounded-lg pl-9 pr-4 py-2 text-sm text-[#F5F0E8] font-mono placeholder:text-[#F5F0E8]/20 focus:outline-none focus:border-[#C9A84C]/40"
          />
        </div>
        <select
          value={category}
          onChange={(e) => { setCategory(e.target.value); setPage(1); }}
          className="bg-[#1A1612] border border-[#C9A84C]/10 rounded-lg px-3 py-2 text-sm text-[#F5F0E8] font-mono focus:outline-none"
        >
          <option value="">All Categories</option>
          <option value="men">Men</option>
          <option value="women">Women</option>
          <option value="couples">Couples</option>
        </select>
        <select
          value={publishFilter}
          onChange={(e) => { setPublishFilter(e.target.value); setPage(1); }}
          className="bg-[#1A1612] border border-[#C9A84C]/10 rounded-lg px-3 py-2 text-sm text-[#F5F0E8] font-mono focus:outline-none"
        >
          <option value="">All Status</option>
          <option value="true">Published</option>
          <option value="false">Draft</option>
        </select>
      </div>

      {/* Bulk actions */}
      {selected.length > 0 && (
        <div className="flex items-center gap-3 bg-[#C9A84C]/10 border border-[#C9A84C]/20 rounded-lg px-4 py-3">
          <span className="text-sm text-[#C9A84C] font-mono">{selected.length} selected</span>
          <div className="flex gap-2 ml-auto">
            <button
              onClick={() => bulkMutation.mutate({ ids: selected, action: 'publish' })}
              className="text-xs px-3 py-1.5 rounded bg-emerald-500/20 text-emerald-400 font-mono hover:bg-emerald-500/30 transition-colors"
            >
              Publish
            </button>
            <button
              onClick={() => bulkMutation.mutate({ ids: selected, action: 'unpublish' })}
              className="text-xs px-3 py-1.5 rounded bg-amber-500/20 text-amber-400 font-mono hover:bg-amber-500/30 transition-colors"
            >
              Unpublish
            </button>
            {canDelete && (
              <button
                onClick={() => {
                  if (confirm(`Delete ${selected.length} products?`)) {
                    bulkMutation.mutate({ ids: selected, action: 'delete' });
                  }
                }}
                className="text-xs px-3 py-1.5 rounded bg-red-500/20 text-red-400 font-mono hover:bg-red-500/30 transition-colors"
              >
                Delete
              </button>
            )}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-[#1A1612] border border-[#C9A84C]/10 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#C9A84C]/10">
                <th className="w-10 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selected.length === products.length && products.length > 0}
                    onChange={toggleAll}
                    className="accent-[#C9A84C]"
                  />
                </th>
                {['Product', 'Category', 'Price', 'Stock', 'Status', 'Sold', 'Actions'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs text-[#F5F0E8]/40 font-mono uppercase tracking-widest">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F5F0E8]/5">
              {isLoading &&
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(8)].map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-[#F5F0E8]/5 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))}
              {!isLoading && products.map((p) => (
                <tr key={p._id} className="hover:bg-[#F5F0E8]/2 transition-colors group">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selected.includes(p._id)}
                      onChange={(e) =>
                        setSelected(e.target.checked ? [...selected, p._id] : selected.filter((id) => id !== p._id))
                      }
                      className="accent-[#C9A84C]"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[#C9A84C]/10 overflow-hidden flex-shrink-0">
                        {p.images[0] && (
                          <Image src={p.images[0]} alt={p.name} width={40} height={40} className="object-cover w-full h-full" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm text-[#F5F0E8]/90 font-medium line-clamp-1">{p.name}</p>
                        <p className="text-xs text-[#F5F0E8]/30 font-mono">{p.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs px-2 py-1 rounded-full bg-[#C9A84C]/10 text-[#C9A84C] font-mono capitalize">
                      {p.category} · {p.subCategory}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm text-[#F5F0E8]/80 font-mono">
                      ₹{p.price.toLocaleString('en-IN')}
                    </p>
                    {p.comparePrice && (
                      <p className="text-xs text-[#F5F0E8]/30 font-mono line-through">
                        ₹{p.comparePrice.toLocaleString('en-IN')}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-mono ${totalStock(p) < 5 ? 'text-[#B5451B]' : 'text-[#F5F0E8]/60'}`}>
                      {totalStock(p)} units
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-mono ${p.isPublished ? 'bg-emerald-500/10 text-emerald-400' : 'bg-[#F5F0E8]/5 text-[#F5F0E8]/40'}`}>
                      {p.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-[#F5F0E8]/40 font-mono">{p.totalSold}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {canManage && (
                        <Link href={`/admin/products/${p._id}/edit`} className="text-[#F5F0E8]/40 hover:text-[#C9A84C] transition-colors">
                          <Edit className="w-4 h-4" />
                        </Link>
                      )}
                      {canDelete && (
                        <button
                          onClick={() => { if (confirm('Delete this product?')) deleteMutation.mutate(p._id); }}
                          className="text-[#F5F0E8]/40 hover:text-[#B5451B] transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                      <Link href={`/products/${p.slug}`} target="_blank" className="text-[#F5F0E8]/40 hover:text-[#F5F0E8] transition-colors">
                        {p.isPublished ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
              {!isLoading && products.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-16 text-center text-[#F5F0E8]/30 font-mono text-sm">
                    No products found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && pagination.pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-[#C9A84C]/10">
            <p className="text-xs text-[#F5F0E8]/40 font-mono">
              Page {page} of {pagination.pages} · {pagination.total} results
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded text-[#F5F0E8]/40 hover:text-[#F5F0E8] disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                disabled={page === pagination.pages}
                className="p-1.5 rounded text-[#F5F0E8]/40 hover:text-[#F5F0E8] disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
