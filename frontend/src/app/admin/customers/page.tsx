'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Search, ChevronLeft, ChevronRight, X, CreditCard } from 'lucide-react';
import toast from 'react-hot-toast';

interface Customer {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  isActive: boolean;
  isEmailVerified: boolean;
  storeCredit: number;
  createdAt: string;
  lastLoginAt?: string;
  totalOrders: number;
  totalSpend: number;
}

interface CustomerDetail {
  customer: Customer & { addresses: any[] };
  orders: {
    _id: string;
    total: number;
    paymentStatus: string;
    fulfilmentStatus: string;
    createdAt: string;
  }[];
}

export default function AdminCustomersPage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [creditAmount, setCreditAmount] = useState('');
  const [creditReason, setCreditReason] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-customers', page, search],
    queryFn: () =>
      api.get('/admin/customers', {
        params: { page, limit: 20, search: search || undefined },
      }).then((r) => r.data),
  });

  const customers: Customer[] = data?.data ?? [];
  const pagination = data?.pagination;

  const { data: detailData } = useQuery<CustomerDetail>({
    queryKey: ['admin-customer-detail', selectedId],
    queryFn: () =>
      api.get(`/admin/customers/${selectedId}`).then((r) => r.data.data),
    enabled: !!selectedId,
  });

  const toggleMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/admin/customers/${id}/toggle`),
    onSuccess: () => {
      toast.success('Customer status updated');
      qc.invalidateQueries({ queryKey: ['admin-customers'] });
      qc.invalidateQueries({ queryKey: ['admin-customer-detail', selectedId] });
    },
    onError: () => toast.error('Failed to update'),
  });

  const creditMutation = useMutation({
    mutationFn: ({ id, amount, reason }: { id: string; amount: number; reason: string }) =>
      api.patch(`/admin/customers/${id}/credit`, { amount, reason }),
    onSuccess: () => {
      toast.success(`₹${creditAmount} store credit issued`);
      qc.invalidateQueries({ queryKey: ['admin-customers'] });
      qc.invalidateQueries({ queryKey: ['admin-customer-detail', selectedId] });
      setCreditAmount('');
      setCreditReason('');
    },
    onError: () => toast.error('Failed to issue credit'),
  });

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

  const selectedCustomer = detailData?.customer;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#F5F0E8] font-mono">Customers</h1>
        <p className="text-[#F5F0E8]/40 text-sm font-mono mt-1">
          {pagination?.total ?? 0} registered customers
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#F5F0E8]/30" />
        <input
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search by name or email..."
          className="w-full bg-[#1A1612] border border-[#C9A84C]/10 rounded-lg pl-9 pr-4 py-2 text-sm text-[#F5F0E8] font-mono placeholder:text-[#F5F0E8]/20 focus:outline-none focus:border-[#C9A84C]/40"
        />
      </div>

      {/* Table */}
      <div className="bg-[#1A1612] border border-[#C9A84C]/10 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#C9A84C]/10">
                {['Customer', 'Joined', 'Orders', 'Total Spend', 'Credit', 'Status'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs text-[#F5F0E8]/40 font-mono uppercase tracking-widest">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F5F0E8]/5">
              {isLoading && [...Array(5)].map((_, i) => (
                <tr key={i}>
                  {[...Array(6)].map((_, j) => (
                    <td key={j} className="px-4 py-4">
                      <div className="h-4 bg-[#F5F0E8]/5 rounded animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))}
              {!isLoading && customers.map((c) => (
                <tr
                  key={c._id}
                  onClick={() => setSelectedId(c._id)}
                  className="hover:bg-[#F5F0E8]/2 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#C9A84C]/15 flex items-center justify-center text-[#C9A84C] text-xs font-bold flex-shrink-0">
                        {c.name[0]?.toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm text-[#F5F0E8]/80 font-medium">{c.name}</p>
                        <p className="text-xs text-[#F5F0E8]/30 font-mono">{c.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-xs text-[#F5F0E8]/40 font-mono">
                    {new Date(c.createdAt).toLocaleDateString('en-IN')}
                  </td>
                  <td className="px-4 py-4 text-sm text-[#F5F0E8]/60 font-mono">
                    {c.totalOrders}
                  </td>
                  <td className="px-4 py-4 text-sm text-[#C9A84C] font-mono">
                    {formatCurrency(c.totalSpend)}
                  </td>
                  <td className="px-4 py-4 text-xs text-[#F5F0E8]/40 font-mono">
                    {c.storeCredit > 0 ? (
                      <span className="text-emerald-400">{formatCurrency(c.storeCredit)}</span>
                    ) : '—'}
                  </td>
                  <td className="px-4 py-4">
                    <span className={`text-xs px-2 py-1 rounded-full font-mono ${c.isActive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                      {c.isActive ? 'Active' : 'Blocked'}
                    </span>
                  </td>
                </tr>
              ))}
              {!isLoading && customers.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-16 text-center text-[#F5F0E8]/30 font-mono text-sm">
                    No customers found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {pagination && pagination.pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-[#C9A84C]/10">
            <p className="text-xs text-[#F5F0E8]/40 font-mono">
              Page {page} of {pagination.pages} · {pagination.total} customers
            </p>
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

      {/* Customer Detail Drawer */}
      {selectedId && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedId(null)} />
          <div className="relative bg-[#1A1612] border-l border-[#C9A84C]/10 w-full max-w-md h-full overflow-y-auto">
            <div className="sticky top-0 bg-[#1A1612] border-b border-[#C9A84C]/10 px-6 py-4 flex items-center justify-between">
              <h2 className="text-sm font-mono text-[#C9A84C] tracking-widest">CUSTOMER PROFILE</h2>
              <button onClick={() => setSelectedId(null)} className="text-[#F5F0E8]/40 hover:text-[#F5F0E8]">
                <X className="w-5 h-5" />
              </button>
            </div>

            {!selectedCustomer ? (
              <div className="p-6 space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-12 bg-[#F5F0E8]/5 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="p-6 space-y-6">
                {/* Profile */}
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-[#C9A84C]/20 border border-[#C9A84C]/30 flex items-center justify-center text-[#C9A84C] text-xl font-bold">
                    {selectedCustomer.name[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p className="text-[#F5F0E8] font-semibold">{selectedCustomer.name}</p>
                    <p className="text-[#F5F0E8]/40 text-sm font-mono">{selectedCustomer.email}</p>
                    {selectedCustomer.phone && (
                      <p className="text-[#F5F0E8]/30 text-xs font-mono">{selectedCustomer.phone}</p>
                    )}
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Orders', value: detailData?.orders.length ?? 0 },
                    { label: 'Spent', value: formatCurrency(detailData?.orders.filter(o => o.paymentStatus === 'paid').reduce((a, o) => a + o.total, 0) ?? 0) },
                    { label: 'Credit', value: formatCurrency(selectedCustomer.storeCredit) },
                  ].map(({ label, value }) => (
                    <div key={label} className="bg-[#0F0D0B] rounded-lg p-3 text-center">
                      <p className="text-lg font-bold text-[#C9A84C] font-mono">{value}</p>
                      <p className="text-xs text-[#F5F0E8]/30 font-mono">{label}</p>
                    </div>
                  ))}
                </div>

                {/* Issue Credit */}
                <div className="bg-[#0F0D0B] rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <CreditCard className="w-4 h-4 text-[#C9A84C]" />
                    <p className="text-xs font-mono text-[#C9A84C] tracking-widest">ISSUE STORE CREDIT</p>
                  </div>
                  <div className="space-y-2">
                    <input
                      type="number"
                      value={creditAmount}
                      onChange={(e) => setCreditAmount(e.target.value)}
                      placeholder="Amount (₹)"
                      className="w-full bg-[#1A1612] border border-[#C9A84C]/10 rounded-lg px-3 py-2 text-sm text-[#F5F0E8] font-mono focus:outline-none"
                    />
                    <input
                      value={creditReason}
                      onChange={(e) => setCreditReason(e.target.value)}
                      placeholder="Reason"
                      className="w-full bg-[#1A1612] border border-[#C9A84C]/10 rounded-lg px-3 py-2 text-sm text-[#F5F0E8] font-mono focus:outline-none"
                    />
                    <button
                      onClick={() => creditMutation.mutate({
                        id: selectedId,
                        amount: Number(creditAmount),
                        reason: creditReason,
                      })}
                      disabled={!creditAmount || creditMutation.isPending}
                      className="w-full bg-[#C9A84C] text-[#1A1612] py-2 rounded-lg font-mono font-bold text-sm disabled:opacity-50 hover:bg-[#C9A84C]/90 transition-colors"
                    >
                      {creditMutation.isPending ? 'Issuing...' : 'Issue Credit'}
                    </button>
                  </div>
                </div>

                {/* Order History */}
                <div>
                  <p className="text-xs font-mono text-[#C9A84C] tracking-widest mb-3">ORDER HISTORY</p>
                  <div className="space-y-2">
                    {detailData?.orders.map((order) => (
                      <div key={order._id} className="flex items-center justify-between py-2 border-b border-[#F5F0E8]/5 last:border-0">
                        <div>
                          <p className="text-xs text-[#F5F0E8]/60 font-mono">#{order._id.slice(-6).toUpperCase()}</p>
                          <p className="text-xs text-[#F5F0E8]/30 font-mono">
                            {new Date(order.createdAt).toLocaleDateString('en-IN')}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-[#C9A84C] font-mono">{formatCurrency(order.total)}</p>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                            order.fulfilmentStatus === 'delivered'
                              ? 'bg-emerald-500/10 text-emerald-400'
                              : 'bg-amber-500/10 text-amber-400'
                          }`}>
                            {order.fulfilmentStatus}
                          </span>
                        </div>
                      </div>
                    ))}
                    {detailData?.orders.length === 0 && (
                      <p className="text-xs text-[#F5F0E8]/25 font-mono text-center py-4">No orders yet</p>
                    )}
                  </div>
                </div>

                {/* Block/Unblock */}
                <button
                  onClick={() => toggleMutation.mutate(selectedId)}
                  disabled={toggleMutation.isPending}
                  className={`w-full py-2.5 rounded-lg font-mono text-sm border transition-colors ${
                    selectedCustomer.isActive
                      ? 'border-[#B5451B]/30 text-[#B5451B] hover:bg-[#B5451B]/10'
                      : 'border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10'
                  }`}
                >
                  {selectedCustomer.isActive ? 'Block Customer' : 'Unblock Customer'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
