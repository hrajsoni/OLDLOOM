import { UserRole } from '../models/User';

export const Permission = {
  // Products
  MANAGE_PRODUCTS: 'MANAGE_PRODUCTS',
  DELETE_PRODUCTS: 'DELETE_PRODUCTS',
  // Orders
  MANAGE_ORDERS: 'MANAGE_ORDERS',
  DELETE_ORDERS: 'DELETE_ORDERS',
  UPDATE_ORDER_STATUS: 'UPDATE_ORDER_STATUS',
  PROCESS_REFUNDS: 'PROCESS_REFUNDS',
  // Staff
  MANAGE_STAFF: 'MANAGE_STAFF',
  // Analytics
  VIEW_ANALYTICS: 'VIEW_ANALYTICS',
  VIEW_FINANCIALS: 'VIEW_FINANCIALS',
  // Coupons
  MANAGE_COUPONS: 'MANAGE_COUPONS',
  // Content
  MANAGE_CONTENT: 'MANAGE_CONTENT',
  // Customers
  MANAGE_CUSTOMERS: 'MANAGE_CUSTOMERS',
  // Inventory
  MANAGE_INVENTORY: 'MANAGE_INVENTORY',
} as const;

export type PermissionKey = (typeof Permission)[keyof typeof Permission];

export const ROLE_PERMISSIONS: Record<UserRole, PermissionKey[]> = {
  customer: [],

  support_staff: [
    Permission.UPDATE_ORDER_STATUS,
    Permission.MANAGE_CUSTOMERS,
  ],

  content_editor: [
    Permission.MANAGE_PRODUCTS,
    Permission.MANAGE_CONTENT,
  ],

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

export function hasPermission(role: UserRole, permission: PermissionKey): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}
