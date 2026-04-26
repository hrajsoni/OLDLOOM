import { Router } from 'express';
import { protect, requireRole } from '../middleware/auth';
import { checkPermission, auditLog } from '../middleware/checkPermission';
import { Permission } from '../config/permissions';

// Controllers
import * as dashboardCtrl from '../controllers/admin/dashboard.controller';
import * as productAdminCtrl from '../controllers/admin/productAdmin.controller';
import * as orderAdminCtrl from '../controllers/admin/orderAdmin.controller';
import * as inventoryCtrl from '../controllers/admin/inventory.controller';
import * as staffCtrl from '../controllers/admin/staff.controller';
import * as couponAdminCtrl from '../controllers/admin/couponAdmin.controller';
import * as contentCtrl from '../controllers/admin/content.controller';
import * as customerCtrl from '../controllers/admin/customer.controller';
import * as auditCtrl from '../controllers/admin/audit.controller';

const router = Router();

// All admin routes require auth + staff role minimum
router.use(protect);
router.use(requireRole('super_admin', 'manager', 'content_editor', 'support_staff'));

// ── Dashboard ──────────────────────────────────────────────────────────────────
router.get(
  '/dashboard/stats',
  checkPermission(Permission.VIEW_ANALYTICS),
  dashboardCtrl.getStats
);
router.get(
  '/dashboard/revenue',
  checkPermission(Permission.VIEW_FINANCIALS),
  dashboardCtrl.getRevenueChart
);
router.get(
  '/dashboard/top-products',
  checkPermission(Permission.VIEW_ANALYTICS),
  dashboardCtrl.getTopProducts
);
router.get(
  '/dashboard/recent-orders',
  checkPermission(Permission.VIEW_ANALYTICS),
  dashboardCtrl.getRecentOrders
);

// ── Products ───────────────────────────────────────────────────────────────────
router.get('/products', checkPermission(Permission.MANAGE_PRODUCTS), productAdminCtrl.listProducts);
router.get('/products/:id', checkPermission(Permission.MANAGE_PRODUCTS), productAdminCtrl.getProduct);
router.post(
  '/products',
  checkPermission(Permission.MANAGE_PRODUCTS),
  auditLog('CREATE_PRODUCT', 'product'),
  productAdminCtrl.createProduct
);
router.put(
  '/products/:id',
  checkPermission(Permission.MANAGE_PRODUCTS),
  auditLog('UPDATE_PRODUCT', 'product'),
  productAdminCtrl.updateProduct
);
router.delete(
  '/products/:id',
  checkPermission(Permission.DELETE_PRODUCTS),
  auditLog('DELETE_PRODUCT', 'product'),
  productAdminCtrl.deleteProduct
);
router.patch(
  '/products/bulk',
  checkPermission(Permission.MANAGE_PRODUCTS),
  auditLog('BULK_UPDATE_PRODUCTS', 'product'),
  productAdminCtrl.bulkUpdate
);

// ── Orders ─────────────────────────────────────────────────────────────────────
router.get('/orders', checkPermission(Permission.MANAGE_ORDERS), orderAdminCtrl.listOrders);
router.get('/orders/:id', checkPermission(Permission.MANAGE_ORDERS), orderAdminCtrl.getOrder);
router.patch(
  '/orders/:id/status',
  checkPermission(Permission.UPDATE_ORDER_STATUS),
  auditLog('UPDATE_ORDER_STATUS', 'order'),
  orderAdminCtrl.updateOrderStatus
);
router.post(
  '/orders/:id/refund',
  checkPermission(Permission.PROCESS_REFUNDS),
  auditLog('PROCESS_REFUND', 'order'),
  orderAdminCtrl.processRefund
);
router.get('/orders/export/csv', checkPermission(Permission.MANAGE_ORDERS), orderAdminCtrl.exportCSV);

// ── Inventory ──────────────────────────────────────────────────────────────────
router.get('/inventory', checkPermission(Permission.MANAGE_INVENTORY), inventoryCtrl.getInventory);
router.patch(
  '/inventory/:productId/variant/:sku',
  checkPermission(Permission.MANAGE_INVENTORY),
  auditLog('UPDATE_INVENTORY', 'product'),
  inventoryCtrl.updateVariantStock
);
router.get('/inventory/low-stock', checkPermission(Permission.MANAGE_INVENTORY), inventoryCtrl.getLowStock);

// ── Staff (super_admin only) ───────────────────────────────────────────────────
router.get('/staff', requireRole('super_admin'), staffCtrl.listStaff);
router.post(
  '/staff/invite',
  requireRole('super_admin'),
  auditLog('INVITE_STAFF', 'user'),
  staffCtrl.inviteStaff
);
router.patch(
  '/staff/:id/role',
  requireRole('super_admin'),
  auditLog('CHANGE_STAFF_ROLE', 'user'),
  staffCtrl.changeRole
);
router.patch(
  '/staff/:id/toggle',
  requireRole('super_admin'),
  auditLog('TOGGLE_STAFF_STATUS', 'user'),
  staffCtrl.toggleActive
);
router.get('/staff/:id/activity', requireRole('super_admin'), staffCtrl.getActivity);

// ── Coupons ────────────────────────────────────────────────────────────────────
router.get('/coupons', checkPermission(Permission.MANAGE_COUPONS), couponAdminCtrl.listCoupons);
router.post(
  '/coupons',
  checkPermission(Permission.MANAGE_COUPONS),
  auditLog('CREATE_COUPON', 'coupon'),
  couponAdminCtrl.createCoupon
);
router.patch(
  '/coupons/:id',
  checkPermission(Permission.MANAGE_COUPONS),
  auditLog('UPDATE_COUPON', 'coupon'),
  couponAdminCtrl.updateCoupon
);
router.delete(
  '/coupons/:id',
  checkPermission(Permission.MANAGE_COUPONS),
  auditLog('DELETE_COUPON', 'coupon'),
  couponAdminCtrl.deleteCoupon
);

// ── Content ────────────────────────────────────────────────────────────────────
router.get('/content', checkPermission(Permission.MANAGE_CONTENT), contentCtrl.getContent);
router.put(
  '/content',
  checkPermission(Permission.MANAGE_CONTENT),
  auditLog('UPDATE_CONTENT', 'content'),
  contentCtrl.updateContent
);

// ── Customers ──────────────────────────────────────────────────────────────────
router.get('/customers', checkPermission(Permission.MANAGE_CUSTOMERS), customerCtrl.listCustomers);
router.get('/customers/:id', checkPermission(Permission.MANAGE_CUSTOMERS), customerCtrl.getCustomer);
router.patch(
  '/customers/:id/credit',
  checkPermission(Permission.MANAGE_CUSTOMERS),
  auditLog('ISSUE_STORE_CREDIT', 'user'),
  customerCtrl.issueCredit
);
router.patch(
  '/customers/:id/toggle',
  checkPermission(Permission.MANAGE_CUSTOMERS),
  auditLog('TOGGLE_CUSTOMER_STATUS', 'user'),
  customerCtrl.toggleActive
);

// ── Audit Log ──────────────────────────────────────────────────────────────────
router.get('/audit-log', requireRole('super_admin'), auditCtrl.getLogs);

export default router;
