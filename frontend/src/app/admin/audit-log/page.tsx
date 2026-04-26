'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';

interface AuditEntry {
  _id: string;
  user: { name: string; email: string; role: string };
  action: string;
  target: string;
  targetId?: string;
  ip: string;
  createdAt: string;
}

const ACTION_COLORS: Record<string, string> = {
  CREATE_PRODUCT: 'text-emerald-400 bg-emerald-500/10',
  UPDATE_PRODUCT: 'text-sky-400 bg-sky-500/10',
  DELETE_PRODUCT: 'text-red-400 bg-red-500/10',
  BULK_UPDATE_PRODUCTS: 'text-amber-400 bg-amber-500/10',
  UPDATE_ORDER_STATUS: 'text-violet-400 bg-violet-500/10',
  PROCESS_REFUND: 'text-orange-400 bg-orange-500/10',
  INVITE_STAFF: 'text-[#C9A84C] bg-[#C9A84C]/10',
  CHANGE_STAFF_ROLE: 'text-blue-400 bg-blue-500/10',
  UPDATE_CONTENT: 'text-pink-400 bg-pink-500/10',
  CREATE_COUPON: 'text-teal-400 bg-teal-500/10',
  ISSUE_STORE_CREDIT: 'text-lime-400 bg-lime-500/10',
};

export default function AuditLogPage() {
  const [page, setPage] = useState(1);
  const [actionFilter, setActionFilter] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-audit', page, actionFilter],
    queryFn: () =>
      api.get('/admin/audit-log', {
        params: { page, limit: 50, action: actionFilter || undefined },
      }).then((r) => r.data),
  });

  const logs: AuditEntry[] = data?.data ?? [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#F5F0E8] font-mono">Audit Log</h1>
        <p className="text-[#F5F0E8]/40 text-sm font-mono mt-1">
          Immutable record of all admin actions
        </p>
      </div>

      {/* Filter */}
      <div className="flex gap-3">
        <select
          value={actionFilter}
          onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}
          className="bg-[#1A1612] border border-[#C9A84C]/10 rounded-lg px-3 py-2 text-sm text-[#F5F0E8] font-mono focus:outline-none"
        >
          <option value="">All Actions</option>
          {Object.keys(ACTION_COLORS).map((a) => (
            <option key={a} value={a}>{a.replace(/_/g, ' ')}</option>
          ))}
        </select>
      </div>

      {/* Log Table */}
      <div className="bg-[#1A1612] border border-[#C9A84C]/10 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#C9A84C]/10">
                {['Timestamp', 'User', 'Action', 'Target', 'IP'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs text-[#F5F0E8]/40 font-mono uppercase tracking-widest">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F5F0E8]/5">
              {isLoading && [...Array(10)].map((_, i) => (
                <tr key={i}>
                  {[...Array(5)].map((_, j) => (
                    <td key={j} className="px-4 py-3">
                      <div className="h-4 bg-[#F5F0E8]/5 rounded animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))}
              {!isLoading && logs.map((log) => (
                <tr key={log._id} className="hover:bg-[#F5F0E8]/2 transition-colors">
                  <td className="px-4 py-3 text-xs text-[#F5F0E8]/40 font-mono whitespace-nowrap">
                    {new Date(log.createdAt).toLocaleString('en-IN')}
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-xs text-[#F5F0E8]/70 font-medium">{log.user?.name}</p>
                    <p className="text-xs text-[#F5F0E8]/25 font-mono">{log.user?.role?.replace('_', ' ')}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded font-mono ${ACTION_COLORS[log.action] ?? 'text-[#F5F0E8]/40 bg-[#F5F0E8]/5'}`}>
                      {log.action.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-[#F5F0E8]/50 font-mono capitalize">{log.target}</span>
                    {log.targetId && (
                      <span className="text-xs text-[#F5F0E8]/20 font-mono ml-1">
                        #{log.targetId.slice(-6)}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-[#F5F0E8]/25 font-mono">{log.ip}</td>
                </tr>
              ))}
              {!isLoading && logs.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-16 text-center text-[#F5F0E8]/30 font-mono text-sm">
                    No audit entries found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {pagination && pagination.pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-[#C9A84C]/10">
            <p className="text-xs text-[#F5F0E8]/40 font-mono">
              Page {page} of {pagination.pages} · {pagination.total} entries
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
    </div>
  );
}
