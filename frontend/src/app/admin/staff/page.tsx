'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { useAdminRole } from '@/hooks/usePermission';
import { UserPlus, ToggleLeft, ToggleRight, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';

type StaffRole = 'support_staff' | 'content_editor' | 'manager' | 'super_admin';

interface StaffMember {
  _id: string;
  name: string;
  email: string;
  role: StaffRole;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
  invitedBy?: { name: string; email: string };
}

const ROLE_LABELS: Record<StaffRole, string> = {
  support_staff: 'Support Staff',
  content_editor: 'Content Editor',
  manager: 'Manager',
  super_admin: 'Super Admin',
};

const ROLE_COLORS: Record<StaffRole, string> = {
  support_staff: 'bg-sky-500/10 text-sky-400',
  content_editor: 'bg-violet-500/10 text-violet-400',
  manager: 'bg-amber-500/10 text-amber-400',
  super_admin: 'bg-[#C9A84C]/10 text-[#C9A84C]',
};

export default function AdminStaffPage() {
  const qc = useQueryClient();
  const myRole = useAdminRole();
  const isSuperAdmin = myRole === 'super_admin';

  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteForm, setInviteForm] = useState({ name: '', email: '', role: 'support_staff' as StaffRole });

  const { data, isLoading } = useQuery({
    queryKey: ['admin-staff'],
    queryFn: () => api.get('/admin/staff').then((r) => r.data.data),
    enabled: isSuperAdmin,
  });

  const staff: StaffMember[] = data ?? [];

  const inviteMutation = useMutation({
    mutationFn: (form: typeof inviteForm) => api.post('/admin/staff/invite', form),
    onSuccess: () => {
      toast.success(`Invitation sent to ${inviteForm.email}`);
      qc.invalidateQueries({ queryKey: ['admin-staff'] });
      setShowInviteModal(false);
      setInviteForm({ name: '', email: '', role: 'support_staff' });
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Invite failed'),
  });

  const roleMutation = useMutation({
    mutationFn: ({ id, role }: { id: string; role: StaffRole }) =>
      api.patch(`/admin/staff/${id}/role`, { role }),
    onSuccess: () => {
      toast.success('Role updated');
      qc.invalidateQueries({ queryKey: ['admin-staff'] });
    },
    onError: () => toast.error('Failed to update role'),
  });

  const toggleMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/admin/staff/${id}/toggle`),
    onSuccess: (_, id) => {
      const member = staff.find((s) => s._id === id);
      toast.success(`Staff ${member?.isActive ? 'suspended' : 'activated'}`);
      qc.invalidateQueries({ queryKey: ['admin-staff'] });
    },
    onError: () => toast.error('Failed to toggle status'),
  });

  if (!isSuperAdmin) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-[#F5F0E8]/30 font-mono text-sm">
          Super Admin access required
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#F5F0E8] font-mono">Staff</h1>
          <p className="text-[#F5F0E8]/40 text-sm font-mono mt-1">
            {staff.length} team members
          </p>
        </div>
        <button
          onClick={() => setShowInviteModal(true)}
          className="flex items-center gap-2 bg-[#C9A84C] text-[#1A1612] px-4 py-2 rounded-lg text-sm font-bold font-mono hover:bg-[#C9A84C]/90 transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          Invite Staff
        </button>
      </div>

      {/* Staff Grid */}
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {isLoading && [...Array(6)].map((_, i) => (
          <div key={i} className="h-36 bg-[#1A1612] rounded-xl animate-pulse border border-[#C9A84C]/10" />
        ))}
        {!isLoading && staff.map((member) => (
          <div
            key={member._id}
            className={`bg-[#1A1612] border rounded-xl p-5 transition-colors ${
              member.isActive ? 'border-[#C9A84C]/10' : 'border-[#F5F0E8]/5 opacity-60'
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="w-9 h-9 rounded-full bg-[#C9A84C]/20 border border-[#C9A84C]/30 flex items-center justify-center text-[#C9A84C] font-bold text-sm">
                {member.name[0]?.toUpperCase()}
              </div>
              <button
                onClick={() => toggleMutation.mutate(member._id)}
                disabled={toggleMutation.isPending}
                className="text-[#F5F0E8]/30 hover:text-[#C9A84C] transition-colors"
                title={member.isActive ? 'Suspend' : 'Activate'}
              >
                {member.isActive
                  ? <ToggleRight className="w-5 h-5 text-emerald-400" />
                  : <ToggleLeft className="w-5 h-5" />
                }
              </button>
            </div>

            <p className="text-sm text-[#F5F0E8]/90 font-medium">{member.name}</p>
            <p className="text-xs text-[#F5F0E8]/30 font-mono mb-3">{member.email}</p>

            {/* Role selector */}
            <div className="relative">
              <select
                value={member.role}
                onChange={(e) => roleMutation.mutate({ id: member._id, role: e.target.value as StaffRole })}
                className={`w-full appearance-none text-xs px-3 py-1.5 rounded-full font-mono font-medium focus:outline-none cursor-pointer ${ROLE_COLORS[member.role]}`}
                style={{ background: 'transparent' }}
              >
                {Object.entries(ROLE_LABELS).filter(([r]) => r !== 'super_admin').map(([value, label]) => (
                  <option key={value} value={value} className="bg-[#1A1612] text-[#F5F0E8]">
                    {label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none opacity-50" />
            </div>

            <div className="mt-3 pt-3 border-t border-[#F5F0E8]/5 flex justify-between text-xs text-[#F5F0E8]/25 font-mono">
              <span>Joined {new Date(member.createdAt).toLocaleDateString('en-IN')}</span>
              {member.lastLoginAt && (
                <span>Last login {new Date(member.lastLoginAt).toLocaleDateString('en-IN')}</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowInviteModal(false)} />
          <div className="relative bg-[#1A1612] border border-[#C9A84C]/20 rounded-2xl w-full max-w-md p-6">
            <h2 className="text-lg font-bold text-[#F5F0E8] font-mono mb-1">Invite Staff Member</h2>
            <p className="text-xs text-[#F5F0E8]/40 font-mono mb-6">
              They'll receive an email with a setup link
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs text-[#F5F0E8]/40 font-mono uppercase tracking-widest mb-1.5">
                  Full Name
                </label>
                <input
                  value={inviteForm.name}
                  onChange={(e) => setInviteForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full bg-[#0F0D0B] border border-[#C9A84C]/10 rounded-lg px-3 py-2 text-sm text-[#F5F0E8] font-mono focus:outline-none focus:border-[#C9A84C]/30"
                  placeholder="Priya Sharma"
                />
              </div>
              <div>
                <label className="block text-xs text-[#F5F0E8]/40 font-mono uppercase tracking-widest mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  value={inviteForm.email}
                  onChange={(e) => setInviteForm((f) => ({ ...f, email: e.target.value }))}
                  className="w-full bg-[#0F0D0B] border border-[#C9A84C]/10 rounded-lg px-3 py-2 text-sm text-[#F5F0E8] font-mono focus:outline-none focus:border-[#C9A84C]/30"
                  placeholder="priya@example.com"
                />
              </div>
              <div>
                <label className="block text-xs text-[#F5F0E8]/40 font-mono uppercase tracking-widest mb-1.5">
                  Role
                </label>
                <select
                  value={inviteForm.role}
                  onChange={(e) => setInviteForm((f) => ({ ...f, role: e.target.value as StaffRole }))}
                  className="w-full bg-[#0F0D0B] border border-[#C9A84C]/10 rounded-lg px-3 py-2 text-sm text-[#F5F0E8] font-mono focus:outline-none"
                >
                  <option value="support_staff">Support Staff</option>
                  <option value="content_editor">Content Editor</option>
                  <option value="manager">Manager</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => inviteMutation.mutate(inviteForm)}
                disabled={inviteMutation.isPending || !inviteForm.email || !inviteForm.name}
                className="flex-1 bg-[#C9A84C] text-[#1A1612] py-2.5 rounded-lg font-bold font-mono text-sm hover:bg-[#C9A84C]/90 disabled:opacity-50 transition-colors"
              >
                {inviteMutation.isPending ? 'Sending...' : 'Send Invitation'}
              </button>
              <button
                onClick={() => setShowInviteModal(false)}
                className="px-4 py-2.5 rounded-lg font-mono text-sm text-[#F5F0E8]/40 hover:text-[#F5F0E8] transition-colors"
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
