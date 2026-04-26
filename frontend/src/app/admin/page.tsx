'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { usePermission, Permission } from '@/hooks/usePermission';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';
import { TrendingUp, ShoppingBag, Package, AlertTriangle } from 'lucide-react';

interface DashboardStats {
  revenue: { today: number; week: number; month: number };
  orders: { today: number; week: number; month: number; total: number };
  activeProducts: number;
  totalCustomers: number;
  lowStockCount: number;
}

interface RecentOrder {
  _id: string;
  user: { name: string; email: string };
  total: number;
  paymentStatus: string;
  fulfilmentStatus: string;
  createdAt: string;
  items: { name: string }[];
}

interface TopProduct {
  _id: string;
  name: string;
  images: string[];
  price: number;
  totalSold: number;
  category: string;
}

const STATUS_COLORS: Record<string, string> = {
  paid: 'text-emerald-400 bg-emerald-400/10',
  pending: 'text-amber-400 bg-amber-400/10',
  failed: 'text-red-400 bg-red-400/10',
  refunded: 'text-blue-400 bg-blue-400/10',
  placed: 'text-sky-400 bg-sky-400/10',
  processing: 'text-amber-400 bg-amber-400/10',
  shipped: 'text-violet-400 bg-violet-400/10',
  delivered: 'text-emerald-400 bg-emerald-400/10',
  cancelled: 'text-red-400 bg-red-400/10',
};

export default function AdminDashboard() {
  const canViewAnalytics = usePermission(Permission.VIEW_ANALYTICS);
  const canViewFinancials = usePermission(Permission.VIEW_FINANCIALS);

  const { data: stats } = useQuery<DashboardStats>({
    queryKey: ['admin', 'stats'],
    queryFn: () => api.get('/admin/dashboard/stats').then((r) => r.data.data),
    enabled: canViewAnalytics,
    refetchInterval: 60_000,
  });

  const { data: revenueChart } = useQuery<{ _id: string; revenue: number; orders: number }[]>({
    queryKey: ['admin', 'revenue-chart'],
    queryFn: () => api.get('/admin/dashboard/revenue?days=30').then((r) => r.data.data),
    enabled: canViewFinancials,
  });

  const { data: recentOrders } = useQuery<RecentOrder[]>({
    queryKey: ['admin', 'recent-orders'],
    queryFn: () => api.get('/admin/dashboard/recent-orders').then((r) => r.data.data),
    enabled: canViewAnalytics,
  });

  const { data: topProducts } = useQuery<TopProduct[]>({
    queryKey: ['admin', 'top-products'],
    queryFn: () => api.get('/admin/dashboard/top-products').then((r) => r.data.data),
    enabled: canViewAnalytics,
  });

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[#F5F0E8] font-mono tracking-wide">Dashboard</h1>
        <p className="text-[#F5F0E8]/40 text-sm font-mono mt-1">Real-time overview of Old Loom</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Revenue Today"
          value={formatCurrency(stats?.revenue.today ?? 0)}
          sub={`₹${((stats?.revenue.month ?? 0) / 1000).toFixed(0)}k this month`}
          icon={TrendingUp}
          show={canViewFinancials}
        />
        <StatCard
          label="Orders Today"
          value={String(stats?.orders.today ?? 0)}
          sub={`${stats?.orders.total ?? 0} total orders`}
          icon={ShoppingBag}
          show={canViewAnalytics}
        />
        <StatCard
          label="Active Products"
          value={String(stats?.activeProducts ?? 0)}
          sub={`${stats?.lowStockCount ?? 0} low stock`}
          icon={Package}
          show={canViewAnalytics}
          alert={!!stats?.lowStockCount}
        />
        <StatCard
          label="Customers"
          value={String(stats?.totalCustomers ?? 0)}
          sub="registered accounts"
          icon={AlertTriangle}
          show={canViewAnalytics}
        />
      </div>

      {/* Revenue Chart */}
      {canViewFinancials && revenueChart && (
        <div className="bg-[#1A1612] border border-[#C9A84C]/10 rounded-xl p-6">
          <h2 className="text-sm font-mono text-[#C9A84C] tracking-widest mb-6">REVENUE — LAST 30 DAYS</h2>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={revenueChart} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(201,168,76,0.08)" />
              <XAxis
                dataKey="_id"
                tick={{ fill: 'rgba(245,240,232,0.3)', fontSize: 10, fontFamily: 'DM Mono' }}
                tickFormatter={(v) => v.slice(5)}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: 'rgba(245,240,232,0.3)', fontSize: 10, fontFamily: 'DM Mono' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip
                contentStyle={{
                  background: '#1A1612',
                  border: '1px solid rgba(201,168,76,0.2)',
                  borderRadius: '8px',
                  fontFamily: 'DM Mono',
                  fontSize: '12px',
                  color: '#F5F0E8',
                }}
                formatter={(v: number) => [formatCurrency(v), 'Revenue']}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#C9A84C"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: '#C9A84C' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        {canViewAnalytics && (
          <div className="bg-[#1A1612] border border-[#C9A84C]/10 rounded-xl p-6">
            <h2 className="text-sm font-mono text-[#C9A84C] tracking-widest mb-4">RECENT ORDERS</h2>
            <div className="space-y-3">
              {recentOrders?.map((order) => (
                <div key={order._id} className="flex items-center gap-3 py-2 border-b border-[#F5F0E8]/5 last:border-0">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[#F5F0E8]/80 truncate font-medium">
                      {order.user?.name || 'Guest'}
                    </p>
                    <p className="text-xs text-[#F5F0E8]/40 font-mono">
                      #{order._id.slice(-6).toUpperCase()}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm text-[#C9A84C] font-mono">{formatCurrency(order.total)}</p>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${STATUS_COLORS[order.paymentStatus] || ''}`}>
                      {order.paymentStatus}
                    </span>
                  </div>
                </div>
              ))}
              {!recentOrders?.length && (
                <p className="text-[#F5F0E8]/30 text-sm font-mono text-center py-8">No orders yet</p>
              )}
            </div>
          </div>
        )}

        {/* Top Products */}
        {canViewAnalytics && (
          <div className="bg-[#1A1612] border border-[#C9A84C]/10 rounded-xl p-6">
            <h2 className="text-sm font-mono text-[#C9A84C] tracking-widest mb-4">TOP PRODUCTS</h2>
            <div className="space-y-3">
              {topProducts?.map((p, i) => (
                <div key={p._id} className="flex items-center gap-3">
                  <span className="text-xs text-[#F5F0E8]/30 font-mono w-4">{i + 1}</span>
                  <div className="w-8 h-8 rounded bg-[#C9A84C]/10 overflow-hidden flex-shrink-0">
                    {p.images[0] && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[#F5F0E8]/80 truncate">{p.name}</p>
                    <p className="text-xs text-[#F5F0E8]/40 font-mono capitalize">{p.category}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs text-[#C9A84C] font-mono">{p.totalSold} sold</p>
                    <p className="text-xs text-[#F5F0E8]/40 font-mono">{formatCurrency(p.price)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  label, value, sub, icon: Icon, show, alert,
}: {
  label: string; value: string; sub: string;
  icon: React.ElementType; show: boolean; alert?: boolean;
}) {
  if (!show) return null;
  return (
    <div className={`bg-[#1A1612] border rounded-xl p-5 ${alert ? 'border-[#B5451B]/40' : 'border-[#C9A84C]/10'}`}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-[#F5F0E8]/40 font-mono uppercase tracking-widest">{label}</p>
        <Icon className={`w-4 h-4 ${alert ? 'text-[#B5451B]' : 'text-[#C9A84C]/40'}`} />
      </div>
      <p className="text-2xl font-bold text-[#F5F0E8] font-mono">{value}</p>
      <p className="text-xs text-[#F5F0E8]/30 font-mono mt-1">{sub}</p>
    </div>
  );
}
