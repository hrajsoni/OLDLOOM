'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { useAdminStore } from '@/store/adminStore';
import { usePermission, Permission } from '@/hooks/usePermission';
import type { UserRole } from '@/types';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Boxes,
  Users,
  Ticket,
  Image,
  UserCog,
  ScrollText,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Menu,
  Bell,
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  permission?: string;
  role?: UserRole[];
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard, permission: Permission.VIEW_ANALYTICS },
  { label: 'Products', href: '/admin/products', icon: Package, permission: Permission.MANAGE_PRODUCTS },
  { label: 'Orders', href: '/admin/orders', icon: ShoppingBag, permission: Permission.MANAGE_ORDERS },
  { label: 'Inventory', href: '/admin/inventory', icon: Boxes, permission: Permission.MANAGE_INVENTORY },
  { label: 'Customers', href: '/admin/customers', icon: Users, permission: Permission.MANAGE_CUSTOMERS },
  { label: 'Coupons', href: '/admin/coupons', icon: Ticket, permission: Permission.MANAGE_COUPONS },
  { label: 'Content', href: '/admin/content', icon: Image, permission: Permission.MANAGE_CONTENT },
  { label: 'Staff', href: '/admin/staff', icon: UserCog, role: ['super_admin'] },
  { label: 'Audit Log', href: '/admin/audit-log', icon: ScrollText, role: ['super_admin'] },
];

interface AdminShellProps {
  children: React.ReactNode;
  user: { name?: string; email?: string; image?: string; role: UserRole };
}

export function AdminShell({ children, user }: AdminShellProps) {
  const pathname = usePathname();
  const { sidebarCollapsed, toggleSidebar } = useAdminStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <div className="min-h-screen bg-[#0F0D0B] text-[#F5F0E8] flex">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full z-50 flex flex-col
          bg-[#1A1612] border-r border-[#C9A84C]/10
          transition-all duration-300 ease-in-out
          ${sidebarCollapsed ? 'w-16' : 'w-60'}
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-[#C9A84C]/10">
          <div className="w-8 h-8 rounded bg-[#C9A84C] flex items-center justify-center flex-shrink-0">
            <span className="text-[#1A1612] font-bold text-xs font-mono">OL</span>
          </div>
          {!sidebarCollapsed && (
            <div>
              <p className="text-[#C9A84C] font-semibold text-sm font-mono tracking-widest">OLD LOOM</p>
              <p className="text-[#F5F0E8]/40 text-xs font-mono">Admin</p>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 space-y-1 px-2">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.href}
              item={item}
              pathname={pathname}
              collapsed={sidebarCollapsed}
              userRole={user.role}
            />
          ))}
        </nav>

        {/* User + collapse */}
        <div className="border-t border-[#C9A84C]/10 p-3 space-y-2">
          {!sidebarCollapsed && (
            <div className="px-2 py-2">
              <p className="text-xs text-[#F5F0E8]/80 truncate font-medium">{user.name}</p>
              <p className="text-xs text-[#C9A84C]/60 truncate font-mono">{user.role?.replace('_', ' ')}</p>
            </div>
          )}
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className={`w-full flex items-center gap-2 px-2 py-2 rounded text-[#F5F0E8]/50 
              hover:text-[#B5451B] hover:bg-[#B5451B]/10 transition-colors text-sm
              ${sidebarCollapsed ? 'justify-center' : ''}`}
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            {!sidebarCollapsed && <span>Sign out</span>}
          </button>
          <button
            onClick={toggleSidebar}
            className="hidden lg:flex w-full items-center justify-center py-1 text-[#F5F0E8]/30 
              hover:text-[#C9A84C] transition-colors"
          >
            {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-60'}`}>
        {/* Topbar */}
        <header className="sticky top-0 z-30 bg-[#1A1612]/80 backdrop-blur-md border-b border-[#C9A84C]/10 px-4 py-3 flex items-center gap-4">
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden text-[#F5F0E8]/60 hover:text-[#C9A84C]"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex-1">
            <p className="text-xs text-[#F5F0E8]/40 font-mono">
              {pathname.split('/').filter(Boolean).join(' / ')}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button className="relative text-[#F5F0E8]/50 hover:text-[#C9A84C] transition-colors">
              <Bell className="w-4 h-4" />
            </button>
            <div className="w-7 h-7 rounded-full bg-[#C9A84C]/20 border border-[#C9A84C]/40 
              flex items-center justify-center text-xs text-[#C9A84C] font-bold">
              {user.name?.[0]?.toUpperCase()}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}

function NavLink({
  item,
  pathname,
  collapsed,
  userRole,
}: {
  item: NavItem;
  pathname: string;
  collapsed: boolean;
  userRole: UserRole;
}) {
  const hasPermission = usePermission(item.permission as any);
  const hasRole = !item.role || item.role.includes(userRole);

  if (item.permission && !hasPermission) return null;
  if (item.role && !hasRole) return null;

  const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      title={collapsed ? item.label : undefined}
      className={`
        flex items-center gap-3 px-2 py-2.5 rounded-lg text-sm transition-all duration-150
        ${collapsed ? 'justify-center' : ''}
        ${isActive
          ? 'bg-[#C9A84C]/15 text-[#C9A84C] border border-[#C9A84C]/20'
          : 'text-[#F5F0E8]/60 hover:text-[#F5F0E8] hover:bg-white/5'
        }
      `}
    >
      <Icon className="w-4 h-4 flex-shrink-0" />
      {!collapsed && <span className="font-mono text-xs tracking-wide">{item.label}</span>}
    </Link>
  );
}
