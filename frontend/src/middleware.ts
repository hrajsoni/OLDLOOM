import { auth } from '@/auth';
import { NextResponse } from 'next/server';

const ADMIN_ROLES = ['super_admin', 'manager', 'content_editor', 'support_staff'];

export default auth((req) => {
  const { nextUrl } = req;
  const session = req.auth;
  const pathname = nextUrl.pathname;
  const isLoggedIn = !!session;
  const userRole = session?.user?.role;
  const isAdmin = userRole && ADMIN_ROLES.includes(userRole);

  // Admin login page — redirect away if already logged in as admin
  if (pathname === '/admin/login') {
    if (isLoggedIn && isAdmin) {
      return NextResponse.redirect(new URL('/admin', req.url));
    }
    if (isLoggedIn && !isAdmin) {
      return NextResponse.redirect(new URL('/?error=unauthorized', req.url));
    }
    return NextResponse.next();
  }

  // Admin accept-invite — always allow (public token-based page)
  if (pathname === '/admin/accept-invite') {
    return NextResponse.next();
  }

  // All other admin routes
  if (pathname.startsWith('/admin')) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL('/admin/login', req.url));
    }
    if (!isAdmin) {
      return NextResponse.redirect(new URL('/?error=unauthorized', req.url));
    }
  }

  // Customer protected routes
  const customerRoutes = ['/account', '/checkout', '/order-success'];
  if (customerRoutes.some((r) => pathname.startsWith(r))) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL(`/login?callbackUrl=${pathname}`, req.url));
    }
  }

  // Auth pages — redirect logged-in users away
  const authRoutes = ['/login', '/register'];
  if (authRoutes.includes(pathname) && isLoggedIn) {
    if (isAdmin) {
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
