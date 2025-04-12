import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse, type NextRequest } from 'next/server';
import { userHasRole } from '@/lib/utils/get-user-role';
import { shouldBypassAuth } from '@/lib/env';

// Define protected routes that require *any* authenticated user
const PROTECTED_ROUTES = [
  '/dashboard',
  '/create-pip',
  '/profile',
];

// Define routes that require the user to have the 'admin' role
const ADMIN_ROUTES = [
  '/dashboard/settings/pip-templates',
];

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  
  // Skip middleware for API routes to avoid auth processing on server endpoints
  if (pathname.startsWith('/api/')) {
    return NextResponse.next();
  }
  
  let response = NextResponse.next({
    request: {
      headers: req.headers,
    },
  });

  console.log(`Middleware processing: ${pathname}`);

  // Skip auth checks in development environment if bypasses are enabled
  if (shouldBypassAuth()) {
    console.log('Dev environment: bypassing auth checks due to NEXT_PUBLIC_DEV_BYPASS_AUTH');
    return response;
  }

  try {
    // Create a Supabase client configured to use cookies
    const supabase = createMiddlewareClient({ req, res: response });

    // Refresh session if expired - important!
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError) {
      console.error('Middleware session error:', sessionError.message);
      // Allow request to proceed but log error, maybe auth service is down
      return response;
    }

    // 1. Handle Authentication for General Protected Routes
    const isProtectedRoute = PROTECTED_ROUTES.some(route => pathname.startsWith(route));
    if (!session && isProtectedRoute) {
      console.log(`No session for protected route: ${pathname}, redirecting to login`);
      const redirectUrl = new URL('/auth/login', req.url);
      redirectUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(redirectUrl);
    }

    // 2. Handle Authorization for Admin Routes (only if authenticated)
    const isAdminRoute = ADMIN_ROUTES.some(route => pathname.startsWith(route));
    if (session && isAdminRoute) {
      // Use standardized role check: Primarily check app_metadata.roles array
      const isAdmin = userHasRole(session.user, 'admin');

      if (!isAdmin) {
        console.warn(`Non-admin user (${session.user.id}) attempting to access admin route: ${pathname}`);
        // Redirect to dashboard or an unauthorized page
        const redirectUrl = new URL('/dashboard', req.url);
        return NextResponse.redirect(redirectUrl);
      }
      console.log(`Admin user accessing admin route: ${pathname}`);
    }

    // If authenticated and not an admin route, or is an admin on an admin route, allow access
    return response;
  } catch (error) {
    console.error('Middleware error:', error);
    // In case of error, allow the request through rather than breaking navigation
    // The server-side or client-side auth checks will handle it
    return response;
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api).*)',
    '/dashboard/:path*',
    '/create-pip/:path*',
    '/profile/:path*',
    '/login',
    '/auth/:path*',
  ],
};