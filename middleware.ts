import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse, type NextRequest } from 'next/server';
import { userHasRole } from '@/lib/utils/permissions';
import { shouldBypassAuth } from '@/lib/env';
import { UserRole } from '@/types/roles';

// Define protected routes that require *any* authenticated user
const PROTECTED_ROUTES = [
  '/dashboard',
  '/create-pip',
  '/profile',
];

// Define routes that require the user to have the 'admin' role
const ADMIN_ROUTES: string[] = [
];

// Cache to store the last time we refreshed for a given client
// This helps us avoid triggering too many refresh token calls
const TOKEN_REFRESH_CACHE = new Map<string, number>();
// Minimum time between refreshes (in milliseconds) - 5 minutes
const MIN_REFRESH_INTERVAL = 5 * 60 * 1000;
// Backoff time after a refresh failure (in milliseconds) - 30 seconds
const REFRESH_FAILURE_BACKOFF = 30 * 1000;

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

    // Generate a cache key based on client IP or some identifier
    // In a real app, you might use a more reliable identifier than IP
    const clientIdentifier = req.headers.get('x-forwarded-for') || 'unknown';
    const cacheKey = `${clientIdentifier}`;
    
    // Check if we've recently refreshed the token
    const lastRefreshTime = TOKEN_REFRESH_CACHE.get(cacheKey);
    const currentTime = Date.now();
    
    let session;
    let sessionError;
    
    // Only attempt to refresh the token if enough time has passed since last refresh
    if (!lastRefreshTime || (currentTime - lastRefreshTime) > MIN_REFRESH_INTERVAL) {
      // Refresh session if enough time has passed
      const sessionResult = await supabase.auth.getSession();
      session = sessionResult.data.session;
      sessionError = sessionResult.error;
      
      // Update the cache with current time
      TOKEN_REFRESH_CACHE.set(cacheKey, currentTime);
      
      // If there was an error, set a shorter timeout before next attempt
      if (sessionError) {
        console.error('Middleware session error:', sessionError.message);
        TOKEN_REFRESH_CACHE.set(cacheKey, currentTime - MIN_REFRESH_INTERVAL + REFRESH_FAILURE_BACKOFF);
      }
    } else {
      // Just get the current session without refreshing
      const sessionResult = await supabase.auth.getSession();
      session = sessionResult.data.session;
      sessionError = sessionResult.error;
    }
    
    // Clean up old entries from the cache (basic memory management)
    if (TOKEN_REFRESH_CACHE.size > 1000) { // arbitrary limit
      const oldEntries = [...TOKEN_REFRESH_CACHE.entries()]
        .filter(([_, timestamp]) => (currentTime - timestamp) > MIN_REFRESH_INTERVAL * 2);
      
      oldEntries.forEach(([key, _]) => TOKEN_REFRESH_CACHE.delete(key));
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
      const isAdmin = userHasRole(session.user, UserRole.ADMIN);

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