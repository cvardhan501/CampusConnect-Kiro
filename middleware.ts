import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'campus_connect_jwt_super_secret_key_2026_production_secure_min_32_chars!'
);

const PROTECTED_ROUTES = [
  '/dashboard',
  '/issues',
  '/lost-found',
  '/notifications',
  '/profile',
  '/admin',
  '/staff',
  '/claims',
  '/search',
];

const AUTH_ROUTES = ['/login', '/register', '/forgot-password', '/reset-password'];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get('accessToken')?.value;

  let isValidToken = false;
  let userRole = 'Student';

  if (token) {
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      isValidToken = true;
      userRole = (payload.role as string) || 'Student';
    } catch {
      isValidToken = false;
    }
  }

  // Redirect unauthenticated users from protected routes to /login
  const isProtectedRoute = PROTECTED_ROUTES.some((route) => pathname.startsWith(route));
  if (isProtectedRoute && !isValidToken) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated users from auth routes (/login, /register) to /dashboard
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));
  if (isAuthRoute && isValidToken) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  // Admin route check: only Administrators can access /admin
  if (pathname.startsWith('/admin') && userRole !== 'Administrator') {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  // Staff route check: only Staff and Administrators can access /staff
  if (pathname.startsWith('/staff') && userRole !== 'Staff' && userRole !== 'Administrator') {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/auth|public).*)'],
};
