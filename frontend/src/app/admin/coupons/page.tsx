'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Plus, Trash2, X } from 'lucide-react';
import toast from 'react-hot-toast';

interface Coupon {
  _id: string;
  code: string;
  type: 'percent' | 'flat';
  value: number;
  minOrderValue: number;
  maxUses: number;
  usedCount: number;
  expiresAt: string;
  isActive: boolean;
}

const emptyForm = {
  code: '',
  type: 'percent' as 'percent' | 'flat',
  value: 0,
  minOrderValue: 0,
  maxUses: 100,
  expiresAt: '',
  isActive: true,
};

export default function AdminCouponsPage() {
  const qc = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-coupons'],
    queryFn: () => api.get('/admin/coupons').then((r) => r.data.data),
  });

  const coupons: Coupon[] = data ?? [];

  const createMutation = useMutation({
    mutationFn: (payload: typeof form) => api.post('/admin/coupons', payload),
    onSuccess: () => {
      toast.success('Coupon created');
      qc.invalidateQueries({ queryKey: ['admin-coupons'] });
      setShowModal(false);
      setForm(emptyForm);
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to create coupon'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/coupons/${id}`),
    onSuccess: () => {
      toast.success('Coupon deleted');
      qc.invalidateQueries({ queryKey: ['admin-coupons'] });
    },
    onError: () => toast.error('Delete failed'),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      api.patch(`/admin/coupons/${id}`, { isActive }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-coupons'] });
    },
  });

  const generateCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const code = Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    setForm((f) => ({ ...f, code: `OL${code}` }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#F5F0E8] font-mono">Coupons</h1>
          <p className="text-[#F5F0E8]/40 text-sm font-mono mt-1">
            {coupons.length} discount codes
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-[#C9A84C] text-[#1A1612] px-4 py-2 rounded-lg text-sm font-bold font-mono hover:bg-[#C9A84C]/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Coupon
        </button>
      </div>

      {/* Coupons Grid */}
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {isLoading && [...Array(6)].map((_, i) => (
          <div key={i} className="h-40 bg-[#1A1612] rounded-xl animate-pulse border border-[#C9A84C]/10" />
        ))}
        {!isLoading && coupons.map((coupon) => {
          const isExpired = new Date(coupon.expiresAt) < new Date();
          const usagePercent = (coupon.usedCount / coupon.maxUses) * 100;

          return (
            <div
              key={coupon._id}
              className={`bg-[#1A1612] border rounded-xl p-5 transition-colors ${
                isExpired || !coupon.isActive
                  ? 'border-[#F5F0E8]/5 opacity-50'
                  : 'border-[#C9A84C]/10'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-lg font-bold text-[#C9A84C] font-mono tracking-widest">
                    {coupon.code}
                  </p>
                  <p className="text-xs text-[#F5F0E8]/40 font-mono">
                    {coupon.type === 'percent' ? `${coupon.value}% off` : `₹${coupon.value} off`}
                    {coupon.minOrderValue > 0 && ` · min ₹${coupon.minOrderValue}`}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleMutation.mutate({ id: coupon._id, isActive: !coupon.isActive })}
                    className={`text-xs px-2 py-1 rounded-full font-mono transition-colors ${
                      coupon.isActive && !isExpired
                        ? 'bg-emerald-500/10 text-emerald-400'
                        : 'bg-[#F5F0E8]/5 text-[#F5F0E8]/30'
                    }`}
                  >
                    {isExpired ? 'Expired' : coupon.isActive ? 'Active' : 'Inactive'}
                  </button>
                  <button
                    onClick={() => { if (confirm('Delete this coupon?')) deleteMutation.mutate(coupon._id); }}
                    className="text-[#F5F0E8]/20 hover:text-[#B5451B] transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Usage bar */}
              <div className="mb-3">
                <div className="flex justify-between text-xs text-[#F5F0E8]/30 font-mono mb-1">
                  <span>{coupon.usedCount} used</span>
                  <span>{coupon.maxUses} max</span>
                </div>
                <div className="h-1 bg-[#F5F0E8]/5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#C9A84C] rounded-full transition-all"
                    style={{ width: `${Math.min(100, usagePercent)}%` }}
                  />
                </div>
              </div>

              <p className="text-xs text-[#F5F0E8]/25 font-mono">
                Expires {new Date(coupon.expiresAt).toLocaleDateString('en-IN')}
              </p>
            </div>
          );
        })}
        {!isLoading && coupons.length === 0 && (
          <div className="col-span-3 py-16 text-center text-[#F5F0E8]/30 font-mono text-sm">
            No coupons yet. Create your first discount code.
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-[#1A1612] border border-[#C9A84C]/20 rounded-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-[#F5F0E8] font-mono">Create Coupon</h2>
              <button onClick={() => setShowModal(false)} className="text-[#F5F0E8]/40 hover:text-[#F5F0E8]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs text-[#F5F0E8]/40 font-mono uppercase tracking-widest mb-1.5">
                  Coupon Code
                </label>
                <div className="flex gap-2">
                  <input
                    value={form.code}
                    onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
                    className="flex-1 bg-[#0F0D0B] border border-[#C9A84C]/10 rounded-lg px-3 py-2 text-sm text-[#F5F0E8] font-mono focus:outline-none focus:border-[#C9A84C]/30"
                    placeholder="OLDLOOM20"
                  />
                  <button
                    type="button"
                    onClick={generateCode}
                    className="px-3 py-2 bg-[#C9A84C]/10 text-[#C9A84C] rounded-lg text-xs font-mono hover:bg-[#C9A84C]/20 transition-colors"
                  >
                    Generate
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-[#F5F0E8]/40 font-mono uppercase tracking-widest mb-1.5">Type</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as 'percent' | 'flat' }))}
                    className="w-full bg-[#0F0D0B] border border-[#C9A84C]/10 rounded-lg px-3 py-2 text-sm text-[#F5F0E8] font-mono focus:outline-none"
                  >
                    <option value="percent">Percentage</option>
                    <option value="flat">Flat Amount</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-[#F5F0E8]/40 font-mono uppercase tracking-widest mb-1.5">
                    Value ({form.type === 'percent' ? '%' : '₹'})
                  </label>
                  <input
                    type="number"
                    value={form.value}
                    onChange={(e) => setForm((f) => ({ ...f, value: Number(e.target.value) }))}
                    className="w-full bg-[#0F0D0B] border border-[#C9A84C]/10 rounded-lg px-3 py-2 text-sm text-[#F5F0E8] font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-[#F5F0E8]/40 font-mono uppercase tracking-widest mb-1.5">
                    Min Order (₹)
                  </label>
                  <input
                    type="number"
                    value={form.minOrderValue}
                    onChange={(e) => setForm((f) => ({ ...f, minOrderValue: Number(e.target.value) }))}
                    className="w-full bg-[#0F0D0B] border border-[#C9A84C]/10 rounded-lg px-3 py-2 text-sm text-[#F5F0E8] font-mono focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#F5F0E8]/40 font-mono uppercase tracking-widest mb-1.5">
                    Max Uses
                  </label>
                  <input
                    type="number"
                    value={form.maxUses}
                    onChange={(e) => setForm((f) => ({ ...f, maxUses: Number(e.target.value) }))}
                    className="w-full bg-[#0F0D0B] border border-[#C9A84C]/10 rounded-lg px-3 py-2 text-sm text-[#F5F0E8] font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-[#F5F0E8]/40 font-mono uppercase tracking-widest mb-1.5">
                  Expires At
                </label>
                <input
                  type="date"
                  value={form.expiresAt}
                  onChange={(e) => setForm((f) => ({ ...f, expiresAt: e.target.value }))}
                  className="w-full bg-[#0F0D0B] border border-[#C9A84C]/10 rounded-lg px-3 py-2 text-sm text-[#F5F0E8] font-mono focus:outline-none focus:border-[#C9A84C]/30"
                />
              </div>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                  className="accent-[#C9A84C] w-4 h-4"
                />
                <span className="text-sm text-[#F5F0E8]/70 font-mono">Active immediately</span>
              </label>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => createMutation.mutate(form)}
                disabled={createMutation.isPending || !form.code || !form.value || !form.expiresAt}
                className="flex-1 bg-[#C9A84C] text-[#1A1612] py-2.5 rounded-lg font-bold font-mono text-sm hover:bg-[#C9A84C]/90 disabled:opacity-50 transition-colors"
              >
                {createMutation.isPending ? 'Creating...' : 'Create Coupon'}
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2.5 rounded-lg font-mono text-sm text-[#F5F0E8]/40 hover:text-[#F5F0E8]"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
