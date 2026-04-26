'use client';

import { useSession } from 'next-auth/react';
import type { UserRole } from '@/types';

const Permission = {
  MANAGE_PRODUCTS: 'MANAGE_PRODUCTS',
  DELETE_PRODUCTS: 'DELETE_PRODUCTS',
  MANAGE_ORDERS: 'MANAGE_ORDERS',
  DELETE_ORDERS: 'DELETE_ORDERS',
  UPDATE_ORDER_STATUS: 'UPDATE_ORDER_STATUS',
  PROCESS_REFUNDS: 'PROCESS_REFUNDS',
  MANAGE_STAFF: 'MANAGE_STAFF',
  VIEW_ANALYTICS: 'VIEW_ANALYTICS',
  VIEW_FINANCIALS: 'VIEW_FINANCIALS',
  MANAGE_COUPONS: 'MANAGE_COUPONS',
  MANAGE_CONTENT: 'MANAGE_CONTENT',
  MANAGE_CUSTOMERS: 'MANAGE_CUSTOMERS',
  MANAGE_INVENTORY: 'MANAGE_INVENTORY',
} as const;

type PermissionKey = (typeof Permission)[keyof typeof Permission];

const ROLE_PERMISSIONS: Record<UserRole, PermissionKey[]> = {
  customer: [],
  support_staff: [Permission.UPDATE_ORDER_STATUS, Permission.MANAGE_CUSTOMERS],
  content_editor: [Permission.MANAGE_PRODUCTS, Permission.MANAGE_CONTENT],
  manager: [
    Permission.MANAGE_PRODUCTS,
    Permission.DELETE_PRODUCTS,
    Permission.MANAGE_ORDERS,
    Permission.UPDATE_ORDER_STATUS,
    Permission.PROCESS_REFUNDS,
    Permission.VIEW_ANALYTICS,
    Permission.VIEW_FINANCIALS,
    Permission.MANAGE_COUPONS,
    Permission.MANAGE_CONTENT,
    Permission.MANAGE_CUSTOMERS,
    Permission.MANAGE_INVENTORY,
  ],
  super_admin: Object.values(Permission) as PermissionKey[],
};

export function usePermission(permission: PermissionKey): boolean {
  const { data: session } = useSession();
  const role = (session?.user as any)?.role as UserRole | undefined;
  if (!role) return false;
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export function useAdminRole(): UserRole | null {
  const { data: session } = useSession();
  return ((session?.user as any)?.role as UserRole) ?? null;
}

export { Permission };
export type { PermissionKey };
