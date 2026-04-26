import { auth } from '@/auth';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const ADMIN_ROLES = ['super_admin', 'manager', 'content_editor', 'support_staff'];

export default auth((req) => {
  const { nextUrl, auth: session } = req as any;
  const pathname = nextUrl.pathname;
  const isLoggedIn = !!session;
  const userRole = session?.user?.role;

  // ── Protected customer routes ──────────────────────────────────────────────
  const customerRoutes = ['/account', '/checkout', '/order-success'];
  if (customerRoutes.some((r) => pathname.startsWith(r))) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL(`/login?callbackUrl=${pathname}`, req.url));
    }
  }

  // ── Admin routes ───────────────────────────────────────────────────────────
  if (pathname.startsWith('/admin')) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL('/login?callbackUrl=/admin', req.url));
    }
    if (!ADMIN_ROLES.includes(userRole)) {
      return NextResponse.redirect(new URL('/?error=unauthorized', req.url));
    }
  }

  // ── Redirect logged-in users away from auth pages ─────────────────────────
  const authRoutes = ['/login', '/register'];
  if (authRoutes.includes(pathname) && isLoggedIn) {
    const role = userRole;
    if (ADMIN_ROLES.includes(role)) {
      return NextResponse.redirect(new URL('/admin', req.url));
    }
    return NextResponse.redirect(new URL('/account', req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    '/account/:path*',
    '/checkout/:path*',
    '/order-success/:path*',
    '/admin/:path*',
    '/login',
    '/register',
  ],
};
