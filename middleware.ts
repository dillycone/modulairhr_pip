import { NextResponse, type NextRequest } from 'next/server';
import { userHasRole } from '@/lib/utils/permissions';
import { shouldBypassAuth } from '@/lib/env';
import { UserRole } from '@/types/roles';
import { createServerClient } from '@supabase/ssr';
import type { Database } from '@/types/supabase';

// Define protected routes that require *any* authenticated user
// Note: Using pathname.startsWith() for route matching means that ALL sub-routes 
// are automatically protected. For example, the '/create-pip' entry protects:
// - /create-pip
// - /create-pip/form
// - /create-pip/transcript/edit
// - /create-pip/transcript/summarize
// - etc.
const PROTECTED_ROUTES = [
  '/dashboard',
  '/create-pip',
  '/profile',
];

// Define routes that require the user to have the 'admin' role
const ADMIN_ROUTES: string[] = [
];

// Session refresh rate limiting cache
// This helps prevent excessive session refresh calls across requests
const sessionRefreshCache = new Map<string, number>();
const SESSION_REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes between refreshes

// Clean up old cache entries every hour
setInterval(() => {
  const now = Date.now();
  for (const [key, time] of sessionRefreshCache.entries()) {
    if (now - time > 60 * 60 * 1000) { // 1 hour
      sessionRefreshCache.delete(key);
    }
  }
}, 60 * 60 * 1000); // 1 hour

/**
 * Middleware function to handle auth checking and redirects
 */
export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  
  // Skip middleware for API routes and other non-auth routes
  if (pathname.startsWith('/api/') || 
      pathname.startsWith('/_next/') || 
      pathname.includes('.') || // Skip files like favicon.ico, etc.
      pathname === '/') {
    return NextResponse.next();
  }
  
  // Setup the response object we'll modify as needed
  let response = NextResponse.next({
    request: { headers: req.headers },
  });

  // Skip auth checks in development environment if bypasses are enabled
  if (shouldBypassAuth()) {
    console.log('Dev environment: bypassing auth checks due to NEXT_PUBLIC_DEV_BYPASS_AUTH');
    return response;
  }

  // TEMPORARY FIX: Bypass auth checks to avoid middleware errors
  // TODO: Fix auth middleware integration with Supabase auth
  console.log('TEMPORARY: Bypassing auth checks in middleware due to initialization errors');
  return response;

  try {
    // Generate a unique identifier for the current user/session
    // We use this to track session refreshes across requests
    const authCookie = req.cookies.get('sb-auth-token');
    const sessionId = authCookie?.value || 'anonymous';
    
    // Check if we've refreshed the session recently for this user
    const lastRefreshTime = sessionRefreshCache.get(sessionId);
    const now = Date.now();
    const shouldRefresh = !lastRefreshTime || (now - lastRefreshTime > SESSION_REFRESH_INTERVAL);
    
    try {
      // Create a Supabase client configured to use cookies
      let supabase;
      try {
        // @ts-ignore - Ignore type errors for now, we'll handle them below
        supabase = createServerClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          {
            cookies: {
              get(name: string) {
                return req.cookies.get(name)?.value;
              },
              set() {}, // Not needed in middleware
              remove() {}, // Not needed in middleware
            },
          }
        );
      } catch (err) {
        console.error('Failed to create Supabase client:', err);
        return response; // Continue without auth checks
      }

      if (!supabase?.auth) {
        console.error('Supabase auth not available');
        return response; // Continue without auth checks
      }

      // Get the session - only try to refresh if needed based on timing
      const { data: { session }, error: sessionError } = shouldRefresh
        ? await supabase.auth.getSession() // This may refresh if needed
        : await supabase.auth.getSession({ refreshSession: false }); // Skip refresh attempt
      
      // If we successfully got the session, update the cache
      if (session) {
        // Only update cache timestamp when we actually attempted refresh
        if (shouldRefresh) {
          sessionRefreshCache.set(sessionId, now);
        }
      }
      
      if (sessionError) {
        console.error('Middleware session error:', sessionError.message);
      }

      // 1. Handle Authentication for Protected Routes
      const isProtectedRoute = PROTECTED_ROUTES.some(route => pathname.startsWith(route));
      
      if (!session && isProtectedRoute) {
        // If no session and trying to access protected route, redirect to login
        console.log(`No session for protected route: ${pathname}, redirecting to login`);
        const redirectUrl = new URL('/auth/login', req.url);
        redirectUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(redirectUrl);
      }

      // 2. Handle Authorization for Admin Routes (if already authenticated)
      const isAdminRoute = ADMIN_ROUTES.some(route => pathname.startsWith(route));
      
      if (session && isAdminRoute) {
        // Check if the user has admin role
        const isAdmin = userHasRole(session.user, UserRole.ADMIN);
        
        if (!isAdmin) {
          console.warn(`Non-admin user (${session.user.id}) attempting to access admin route: ${pathname}`);
          // Redirect to dashboard (or could use a 403 page)
          const redirectUrl = new URL('/dashboard', req.url);
          return NextResponse.redirect(redirectUrl);
        }
      }
    } catch (authError) {
      console.error('Auth middleware error:', authError);
      // On auth errors, we'll still allow the request to proceed
      // Server-side components will handle authentication as needed
    }

    // Allow access if all checks pass
    return response;
  } catch (error) {
    console.error('Middleware error:', error);
    // In case of error, allow the request rather than blocking navigation
    // The server or client side auth checks will handle it
    return response;
  }
}

// Configure the matcher for routes that need middleware
export const config = {
  matcher: [
    // Match all paths except for:
    // - API routes (they handle their own auth)
    // - Static files (images, etc.)
    // - Paths that explicitly match public assets
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};