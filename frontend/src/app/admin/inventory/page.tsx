'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Image from 'next/image';
import api from '@/lib/api';
import { AlertTriangle, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

interface InventoryProduct {
  _id: string;
  name: string;
  slug: string;
  images: string[];
  category: string;
  variants: {
    size: string;
    color: string;
    colorHex: string;
    stock: number;
    sku: string;
  }[];
}

export default function AdminInventoryPage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [showLowStock, setShowLowStock] = useState(false);
  const [editingCell, setEditingCell] = useState<{ productId: string; sku: string } | null>(null);
  const [editValue, setEditValue] = useState('');

  const { data: inventoryData, isLoading } = useQuery({
    queryKey: ['admin-inventory', page, showLowStock],
    queryFn: () =>
      showLowStock
        ? api.get('/admin/inventory/low-stock').then((r) => r.data)
        : api.get('/admin/inventory', { params: { page, limit: 20 } }).then((r) => r.data),
  });

  const products: InventoryProduct[] = showLowStock
    ? []
    : (inventoryData?.data ?? []);

  const lowStockItems = showLowStock ? (inventoryData?.data ?? []) : [];
  const pagination = inventoryData?.pagination;

  const stockMutation = useMutation({
    mutationFn: ({ productId, sku, stock }: { productId: string; sku: string; stock: number }) =>
      api.patch(`/admin/inventory/${productId}/variant/${sku}`, { stock }),
    onSuccess: () => {
      toast.success('Stock updated');
      qc.invalidateQueries({ queryKey: ['admin-inventory'] });
      setEditingCell(null);
    },
    onError: () => toast.error('Failed to update stock'),
  });

  const startEdit = (productId: string, sku: string, currentStock: number) => {
    setEditingCell({ productId, sku });
    setEditValue(String(currentStock));
  };

  const commitEdit = (productId: string, sku: string) => {
    const stock = parseInt(editValue);
    if (!isNaN(stock) && stock >= 0) {
      stockMutation.mutate({ productId, sku, stock });
    } else {
      setEditingCell(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#F5F0E8] font-mono">Inventory</h1>
          <p className="text-[#F5F0E8]/40 text-sm font-mono mt-1">
            SKU-level stock management
          </p>
        </div>
        <button
          onClick={() => { setShowLowStock((v) => !v); setPage(1); }}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-mono transition-colors ${
            showLowStock
              ? 'bg-[#B5451B] text-white'
              : 'border border-[#B5451B]/30 text-[#B5451B] hover:bg-[#B5451B]/10'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          Low Stock Only
        </button>
      </div>

      {/* Low stock flat view */}
      {showLowStock && (
        <div className="bg-[#1A1612] border border-[#B5451B]/20 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-[#B5451B]/10">
            <p className="text-xs font-mono text-[#B5451B] tracking-widest">
              LOW STOCK ITEMS (below 5 units) — {lowStockItems.length} variants
            </p>
          </div>
          <div className="divide-y divide-[#F5F0E8]/5">
            {lowStockItems.map((item: any) => (
              <div key={item.sku} className="flex items-center gap-4 px-4 py-3">
                <div className="w-8 h-8 rounded bg-[#C9A84C]/10 overflow-hidden flex-shrink-0">
                  {item.image && (
                    <Image src={item.image} alt={item.productName} width={32} height={32} className="object-cover w-full h-full" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[#F5F0E8]/80 truncate">{item.productName}</p>
                  <p className="text-xs text-[#F5F0E8]/30 font-mono">{item.sku} · {item.size} · {item.color}</p>
                </div>
                <StockBadge stock={item.stock} />
              </div>
            ))}
            {lowStockItems.length === 0 && !isLoading && (
              <div className="py-12 text-center text-[#F5F0E8]/30 font-mono text-sm">
                All products well stocked 🎉
              </div>
            )}
          </div>
        </div>
      )}

      {/* Normal inventory table */}
      {!showLowStock && (
        <div className="bg-[#1A1612] border border-[#C9A84C]/10 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#C9A84C]/10">
                  {['Product', 'SKU', 'Size', 'Color', 'Stock', ''].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs text-[#F5F0E8]/40 font-mono uppercase tracking-widest">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F5F0E8]/5">
                {isLoading && [...Array(8)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(6)].map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-[#F5F0E8]/5 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))}
                {!isLoading && products.flatMap((product) =>
                  product.variants.map((variant, vi) => (
                    <tr key={variant.sku} className="hover:bg-[#F5F0E8]/2 transition-colors">
                      {vi === 0 ? (
                        <td className="px-4 py-3" rowSpan={product.variants.length}>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded bg-[#C9A84C]/10 overflow-hidden flex-shrink-0">
                              {product.images[0] && (
                                <Image src={product.images[0]} alt={product.name} width={32} height={32} className="object-cover w-full h-full" />
                              )}
                            </div>
                            <div>
                              <p className="text-sm text-[#F5F0E8]/80 font-medium line-clamp-1">{product.name}</p>
                              <p className="text-xs text-[#F5F0E8]/30 font-mono capitalize">{product.category}</p>
                            </div>
                          </div>
                        </td>
                      ) : null}
                      <td className="px-4 py-3 text-xs text-[#F5F0E8]/40 font-mono">{variant.sku}</td>
                      <td className="px-4 py-3 text-xs text-[#F5F0E8]/60 font-mono">{variant.size}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full border border-[#F5F0E8]/20 flex-shrink-0"
                            style={{ backgroundColor: variant.colorHex }}
                          />
                          <span className="text-xs text-[#F5F0E8]/50 font-mono">{variant.color}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {editingCell?.productId === product._id && editingCell.sku === variant.sku ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') commitEdit(product._id, variant.sku);
                                if (e.key === 'Escape') setEditingCell(null);
                              }}
                              autoFocus
                              className="w-16 bg-[#0F0D0B] border border-[#C9A84C]/30 rounded px-2 py-1 text-xs text-[#F5F0E8] font-mono focus:outline-none"
                            />
                            <button
                              onClick={() => commitEdit(product._id, variant.sku)}
                              className="text-emerald-400 hover:text-emerald-300"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => startEdit(product._id, variant.sku, variant.stock)}
                            className="group flex items-center gap-2"
                          >
                            <StockBadge stock={variant.stock} />
                            <span className="text-xs text-[#C9A84C]/0 group-hover:text-[#C9A84C]/60 font-mono transition-colors">
                              edit
                            </span>
                          </button>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {variant.stock === 0 && (
                          <span className="text-xs text-[#B5451B] font-mono">Out of stock</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {pagination && pagination.pages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-[#C9A84C]/10">
              <p className="text-xs text-[#F5F0E8]/40 font-mono">Page {page} of {pagination.pages}</p>
              <div className="flex gap-2">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                  className="p-1.5 rounded text-[#F5F0E8]/40 hover:text-[#F5F0E8] disabled:opacity-30">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))} disabled={page === pagination.pages}
                  className="p-1.5 rounded text-[#F5F0E8]/40 hover:text-[#F5F0E8] disabled:opacity-30">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function StockBadge({ stock }: { stock: number }) {
  if (stock === 0) return <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 font-mono">0</span>;
  if (stock < 5) return <span className="text-xs px-2 py-0.5 rounded-full bg-[#B5451B]/10 text-[#B5451B] font-mono">{stock}</span>;
  return <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-mono">{stock}</span>;
}
