// FestOS Edge Runtime Middleware
// Cryptographic session verification via jose, route protection, and request header enrichment
// Zero em dashes or en dashes in any copy or comments

import { NextRequest, NextResponse } from 'next/server';
import { verifySession, SESSION_COOKIE_NAME } from './lib/jwt';

// Public path prefixes and exact matches that do not require authentication
const PUBLIC_PATHS = [
  '/login',
  '/api/auth/login',
  '/health',
  '/api/health',
  '/favicon.ico',
];

function isPublicPath(pathname: string): boolean {
  if (PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return true;
  }
  // Next.js internal paths and static assets
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.match(/\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|map)$/)
  ) {
    return true;
  }
  return false;
}

function sanitizeRedirectPath(path: string | null): string | null {
  if (!path) return null;
  // Must start with single slash and not double slash or backslash
  if (path.startsWith('/') && !path.startsWith('//') && !path.includes('\\')) {
    return path;
  }
  return null;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = token ? await verifySession(token) : null;

  // If hitting login page while already authenticated with a valid session
  if (pathname === '/login') {
    if (session) {
      const targetRole = session.role || 'director';
      const redirectUrl = new URL(`/${targetRole}`, request.url);
      return NextResponse.redirect(redirectUrl);
    }
    return NextResponse.next();
  }

  // Allow public paths without authentication
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  // Unauthenticated requests
  if (!session) {
    // API routes return 401 JSON
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        {
          status: 401,
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
            Pragma: 'no-cache',
            Expires: '0',
          },
        }
      );
    }

    // Page routes redirect to /login with sanitized next parameter
    const loginUrl = new URL('/login', request.url);
    const sanitizedNext = sanitizeRedirectPath(pathname + request.nextUrl.search);
    if (sanitizedNext && sanitizedNext !== '/') {
      loginUrl.searchParams.set('next', sanitizedNext);
    }
    return NextResponse.redirect(loginUrl);
  }

  // Authenticated request: forward with enriched headers
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-festos-member-id', session.memberId);
  requestHeaders.set('x-festos-role', session.role);
  requestHeaders.set('x-festos-name', encodeURIComponent(session.name));
  requestHeaders.set('x-festos-shift', session.shift);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
