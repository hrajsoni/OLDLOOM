'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { usePermission, Permission } from '@/hooks/usePermission';
import { Search, ChevronLeft, ChevronRight, Download, X } from 'lucide-react';
import toast from 'react-hot-toast';

interface Order {
  _id: string;
  user: { name: string; email: string } | null;
  items: { name: string; quantity: number; price: number }[];
  shippingAddress: {
    name: string; phone: string; addressLine1: string;
    city: string; state: string; pincode: string;
  };
  paymentStatus: string;
  fulfilmentStatus: string;
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  total: number;
  subtotal: number;
  discountAmount: number;
  deliveryCharge: number;
  gstAmount: number;
  trackingNumber?: string;
  createdAt: string;
}

const PAYMENT_COLORS: Record<string, string> = {
  paid: 'bg-emerald-500/10 text-emerald-400',
  pending: 'bg-amber-500/10 text-amber-400',
  failed: 'bg-red-500/10 text-red-400',
  refunded: 'bg-blue-500/10 text-blue-400',
};

const FULFILMENT_COLORS: Record<string, string> = {
  placed: 'bg-sky-500/10 text-sky-400',
  processing: 'bg-amber-500/10 text-amber-400',
  shipped: 'bg-violet-500/10 text-violet-400',
  delivered: 'bg-emerald-500/10 text-emerald-400',
  cancelled: 'bg-red-500/10 text-red-400',
  returned: 'bg-orange-500/10 text-orange-400',
};

const FULFILMENT_STEPS = [
  'placed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned',
];

export default function AdminOrdersPage() {
  const qc = useQueryClient();
  const canProcessRefund = usePermission(Permission.PROCESS_REFUNDS);
  const canUpdateStatus = usePermission(Permission.UPDATE_ORDER_STATUS);

  const [page, setPage] = useState(1);
  const [paymentFilter, setPaymentFilter] = useState('');
  const [fulfilmentFilter, setFulfilmentFilter] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [trackingInput, setTrackingInput] = useState('');
  const [newStatus, setNewStatus] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-orders', page, paymentFilter, fulfilmentFilter],
    queryFn: () =>
      api.get('/admin/orders', {
        params: {
          page,
          limit: 20,
          paymentStatus: paymentFilter || undefined,
          fulfilmentStatus: fulfilmentFilter || undefined,
        },
      }).then((r) => r.data),
  });

  const orders: Order[] = data?.data ?? [];
  const pagination = data?.pagination;

  const statusMutation = useMutation({
    mutationFn: ({ id, status, tracking }: { id: string; status: string; tracking?: string }) =>
      api.patch(`/admin/orders/${id}/status`, {
        fulfilmentStatus: status,
        trackingNumber: tracking,
      }),
    onSuccess: () => {
      toast.success('Order status updated');
      qc.invalidateQueries({ queryKey: ['admin-orders'] });
      if (selectedOrder) {
        setSelectedOrder((prev) =>
          prev ? { ...prev, fulfilmentStatus: newStatus, trackingNumber: trackingInput || prev.trackingNumber } : null
        );
      }
    },
    onError: () => toast.error('Failed to update status'),
  });

  const refundMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      api.post(`/admin/orders/${id}/refund`, { reason }),
    onSuccess: () => {
      toast.success('Refund initiated');
      qc.invalidateQueries({ queryKey: ['admin-orders'] });
      setSelectedOrder(null);
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Refund failed'),
  });

  const handleExport = async () => {
    try {
      const res = await api.get('/admin/orders/export/csv', { responseType: 'blob' });
      const url = URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `orders-${Date.now()}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error('Export failed');
    }
  };

  const openOrder = (order: Order) => {
    setSelectedOrder(order);
    setNewStatus(order.fulfilmentStatus);
    setTrackingInput(order.trackingNumber || '');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#F5F0E8] font-mono">Orders</h1>
          <p className="text-[#F5F0E8]/40 text-sm font-mono mt-1">
            {pagination?.total ?? 0} total orders
          </p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 border border-[#C9A84C]/20 text-[#C9A84C] px-4 py-2 rounded-lg text-sm font-mono hover:bg-[#C9A84C]/10 transition-colors"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select
          value={paymentFilter}
          onChange={(e) => { setPaymentFilter(e.target.value); setPage(1); }}
          className="bg-[#1A1612] border border-[#C9A84C]/10 rounded-lg px-3 py-2 text-sm text-[#F5F0E8] font-mono focus:outline-none"
        >
          <option value="">All Payments</option>
          {['paid', 'pending', 'failed', 'refunded'].map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <select
          value={fulfilmentFilter}
          onChange={(e) => { setFulfilmentFilter(e.target.value); setPage(1); }}
          className="bg-[#1A1612] border border-[#C9A84C]/10 rounded-lg px-3 py-2 text-sm text-[#F5F0E8] font-mono focus:outline-none"
        >
          <option value="">All Statuses</option>
          {FULFILMENT_STEPS.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-[#1A1612] border border-[#C9A84C]/10 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#C9A84C]/10">
                {['Order', 'Customer', 'Date', 'Items', 'Total', 'Payment', 'Fulfilment'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs text-[#F5F0E8]/40 font-mono uppercase tracking-widest">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F5F0E8]/5">
              {isLoading && [...Array(5)].map((_, i) => (
                <tr key={i}>
                  {[...Array(7)].map((_, j) => (
                    <td key={j} className="px-4 py-4">
                      <div className="h-4 bg-[#F5F0E8]/5 rounded animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))}
              {!isLoading && orders.map((order) => (
                <tr
                  key={order._id}
                  onClick={() => openOrder(order)}
                  className="hover:bg-[#F5F0E8]/2 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-4">
                    <p className="text-xs text-[#C9A84C] font-mono">
                      #{order._id.slice(-8).toUpperCase()}
                    </p>
                  </td>
                  <td className="px-4 py-4">
                    <p className="text-sm text-[#F5F0E8]/80">{order.user?.name ?? 'Guest'}</p>
                    <p className="text-xs text-[#F5F0E8]/30 font-mono">{order.user?.email}</p>
                  </td>
                  <td className="px-4 py-4 text-xs text-[#F5F0E8]/40 font-mono">
                    {new Date(order.createdAt).toLocaleDateString('en-IN')}
                  </td>
                  <td className="px-4 py-4 text-xs text-[#F5F0E8]/60 font-mono">
                    {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                  </td>
                  <td className="px-4 py-4 text-sm text-[#C9A84C] font-mono">
                    ₹{order.total.toLocaleString('en-IN')}
                  </td>
                  <td className="px-4 py-4">
                    <span className={`text-xs px-2 py-1 rounded-full font-mono ${PAYMENT_COLORS[order.paymentStatus] ?? ''}`}>
                      {order.paymentStatus}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`text-xs px-2 py-1 rounded-full font-mono ${FULFILMENT_COLORS[order.fulfilmentStatus] ?? ''}`}>
                      {order.fulfilmentStatus}
                    </span>
                  </td>
                </tr>
              ))}
              {!isLoading && orders.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-16 text-center text-[#F5F0E8]/30 font-mono text-sm">
                    No orders found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {pagination && pagination.pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-[#C9A84C]/10">
            <p className="text-xs text-[#F5F0E8]/40 font-mono">
              Page {page} of {pagination.pages}
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

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setSelectedOrder(null)} />
          <div className="relative bg-[#1A1612] border border-[#C9A84C]/20 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-[#1A1612] border-b border-[#C9A84C]/10 px-6 py-4 flex items-center justify-between">
              <div>
                <p className="text-[#C9A84C] font-mono text-sm">
                  #{selectedOrder._id.slice(-8).toUpperCase()}
                </p>
                <p className="text-[#F5F0E8]/40 text-xs font-mono">
                  {new Date(selectedOrder.createdAt).toLocaleString('en-IN')}
                </p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="text-[#F5F0E8]/40 hover:text-[#F5F0E8]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Items */}
              <div>
                <h3 className="text-xs font-mono text-[#C9A84C] tracking-widest mb-3">ITEMS</h3>
                <div className="space-y-2">
                  {selectedOrder.items.map((item, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-[#F5F0E8]/70">{item.name} × {item.quantity}</span>
                      <span className="text-[#C9A84C] font-mono">
                        ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price breakdown */}
              <div className="bg-[#0F0D0B] rounded-lg p-4 space-y-2 text-sm font-mono">
                <Row label="Subtotal" value={`₹${selectedOrder.subtotal.toLocaleString('en-IN')}`} />
                {selectedOrder.discountAmount > 0 && (
                  <Row label="Discount" value={`-₹${selectedOrder.discountAmount.toLocaleString('en-IN')}`} className="text-emerald-400" />
                )}
                <Row label="Delivery" value={`₹${selectedOrder.deliveryCharge.toLocaleString('en-IN')}`} />
                <Row label="GST (18%)" value={`₹${selectedOrder.gstAmount.toLocaleString('en-IN')}`} />
                <div className="border-t border-[#C9A84C]/10 pt-2">
                  <Row label="Total" value={`₹${selectedOrder.total.toLocaleString('en-IN')}`} bold />
                </div>
              </div>

              {/* Shipping */}
              <div>
                <h3 className="text-xs font-mono text-[#C9A84C] tracking-widest mb-3">SHIPPING ADDRESS</h3>
                <div className="text-sm text-[#F5F0E8]/60 font-mono space-y-1">
                  <p>{selectedOrder.shippingAddress.name}</p>
                  <p>{selectedOrder.shippingAddress.phone}</p>
                  <p>{selectedOrder.shippingAddress.addressLine1}</p>
                  <p>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} — {selectedOrder.shippingAddress.pincode}</p>
                </div>
              </div>

              {/* Status update */}
              {canUpdateStatus && (
                <div>
                  <h3 className="text-xs font-mono text-[#C9A84C] tracking-widest mb-3">UPDATE STATUS</h3>
                  <div className="space-y-3">
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      className="w-full bg-[#0F0D0B] border border-[#C9A84C]/10 rounded-lg px-3 py-2 text-sm text-[#F5F0E8] font-mono focus:outline-none"
                    >
                      {FULFILMENT_STEPS.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                    <input
                      value={trackingInput}
                      onChange={(e) => setTrackingInput(e.target.value)}
                      placeholder="Tracking number (optional)"
                      className="w-full bg-[#0F0D0B] border border-[#C9A84C]/10 rounded-lg px-3 py-2 text-sm text-[#F5F0E8] font-mono placeholder:text-[#F5F0E8]/20 focus:outline-none"
                    />
                    <button
                      onClick={() =>
                        statusMutation.mutate({
                          id: selectedOrder._id,
                          status: newStatus,
                          tracking: trackingInput,
                        })
                      }
                      disabled={statusMutation.isPending}
                      className="w-full bg-[#C9A84C] text-[#1A1612] py-2 rounded-lg font-mono font-bold text-sm hover:bg-[#C9A84C]/90 disabled:opacity-50 transition-colors"
                    >
                      {statusMutation.isPending ? 'Updating...' : 'Update Status'}
                    </button>
                  </div>
                </div>
              )}

              {/* Refund */}
              {canProcessRefund && selectedOrder.paymentStatus === 'paid' && (
                <div>
                  <h3 className="text-xs font-mono text-[#C9A84C] tracking-widest mb-3">REFUND</h3>
                  <button
                    onClick={() => {
                      const reason = prompt('Reason for refund:');
                      if (reason) refundMutation.mutate({ id: selectedOrder._id, reason });
                    }}
                    disabled={refundMutation.isPending}
                    className="w-full border border-[#B5451B]/40 text-[#B5451B] py-2 rounded-lg font-mono text-sm hover:bg-[#B5451B]/10 disabled:opacity-50 transition-colors"
                  >
                    {refundMutation.isPending ? 'Processing...' : 'Issue Full Refund'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ label, value, bold, className }: { label: string; value: string; bold?: boolean; className?: string }) {
  return (
    <div className={`flex justify-between ${bold ? 'text-[#F5F0E8] font-bold' : 'text-[#F5F0E8]/50'} ${className ?? ''}`}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}
