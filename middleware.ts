import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

// Routes that require authentication
const PROTECTED_ROUTES = [
  '/dashboard',
  '/profile',
  '/settings'
];

// Routes that should redirect to dashboard if user is logged in
const AUTH_ROUTES = [
  '/auth/login',
  '/auth/signup',
  '/auth/reset-password'
];

// Special routes that should be allowed to pass through for authentication handling
const AUTH_CALLBACK_ROUTES = [
  '/auth/callback'
];

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  const requestId = Math.random().toString(36).substring(2, 10);
  
  console.log(`[${requestId}] Middleware processing: ${pathname}`);
  
  let response = NextResponse.next({
    request: {
      headers: req.headers,
    },
  });

  try {
    // Skip middleware for auth callback routes to avoid interference with authentication flow
    if (AUTH_CALLBACK_ROUTES.some(route => pathname.startsWith(route))) {
      console.log(`[${requestId}] Bypassing middleware for auth callback: ${pathname}`);
      return NextResponse.next();
    }
    
    // Create a Supabase client for server-side auth
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            const cookie = req.cookies.get(name);
            console.log(`[${requestId}] Getting cookie ${name}: ${cookie ? 'exists' : 'does not exist'}`);
            return cookie?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            // If the cookie is updated, update the response
            console.log(`[${requestId}] Setting cookie ${name}`);
            response = NextResponse.next({
              request: {
                headers: req.headers,
              },
            });
            response.cookies.set({ name, value, ...options });
          },
          remove(name: string, options: CookieOptions) {
            // If the cookie is removed, update the response
            console.log(`[${requestId}] Removing cookie ${name}`);
            response = NextResponse.next({
              request: {
                headers: req.headers,
              },
            });
            response.cookies.set({ name, value: '', ...options });
          },
        },
      }
    );

    // Check for redirect loop prevention header
    const hasRedirectLoopHeader = req.headers.get('x-prevent-redirect-loop');
    if (hasRedirectLoopHeader) {
      console.log(`[${requestId}] Detected redirect loop prevention header, allowing request to continue`);
      return response;
    }

    // Check for authentication bypass token
    const bypassToken = req.cookies.get('auth_bypass_token');
    if (bypassToken && pathname.startsWith('/dashboard')) {
      console.log(`[${requestId}] Auth bypass token found, allowing access to ${pathname}`);
      const headers = new Headers(req.headers);
      headers.set('x-auth-bypass', 'true');
      return NextResponse.next({
        request: {
          headers
        }
      });
    }

    try {
      // Get the user session from cookies
      console.log(`[${requestId}] Attempting to get session...`);
      
      // Get the session (with refresh attempt)
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error(`[${requestId}] Error getting session:`, error);
      }
      
      console.log(`[${requestId}] Middleware auth check: path=${pathname}, hasSession=${!!session}, sessionUser=${session?.user?.email || 'none'}`);

      // If user is signed in and trying to access auth pages, redirect to dashboard
      if (session && AUTH_ROUTES.some(route => pathname.startsWith(route))) {
        console.log(`[${requestId}] Redirecting authenticated user from ${pathname} to /dashboard`);
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }

      // If user is not signed in and trying to access protected routes, redirect to login
      if (!session && PROTECTED_ROUTES.some(route => pathname.startsWith(route))) {
        // But allow the request to continue if we're on a specific route with already active client-side auth check
        if (pathname === '/dashboard/create-pip') {
          // Add a session flag to indicate to the page that it was allowed through without a session
          // This helps the client-side component know it needs to check auth
          const headers = new Headers(req.headers);
          headers.set('x-middleware-bypass', 'true');
          
          console.log(`[${requestId}] Special handling for ${pathname}: allowed through with bypass flag`);
          return NextResponse.next({
            request: {
              headers
            }
          });
        }
        
        console.log(`[${requestId}] Redirecting unauthenticated user from ${pathname} to login`);
        const redirectUrl = req.nextUrl.clone();
        redirectUrl.pathname = '/auth/login';
        // Store the original URL as a redirect parameter
        redirectUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(redirectUrl);
      }

      // For the dashboard route, add a header to prevent redirect loops
      if (pathname.startsWith('/dashboard')) {
        const headers = new Headers(req.headers);
        headers.set('x-prevent-redirect-loop', 'true');
        
        response = NextResponse.next({
          request: {
            headers
          }
        });
      }

      console.log(`[${requestId}] Middleware completed for ${pathname}, proceeding normally`);
      return response;
    } catch (sessionError) {
      console.error(`[${requestId}] Session retrieval error:`, sessionError);
      // If we can't get the session, but it's a dashboard route with a bypass flag in cookies, 
      // allow the client-side app to handle authentication
      if (pathname.startsWith('/dashboard') && bypassToken) {
        console.log(`[${requestId}] Using bypass token to allow access to ${pathname}`);
        const headers = new Headers(req.headers);
        headers.set('x-auth-bypass', 'true');
        return NextResponse.next({
          request: {
            headers
          }
        });
      }
      
      // Otherwise continue to the error handler
      throw sessionError;
    }
  } catch (error) {
    console.error(`[${requestId}] Middleware error:`, error);
    // On error, allow the request to continue but log the error
    return response;
  }
}

// Configure the middleware to run only on specific paths
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/profile/:path*',
    '/settings/:path*',
    '/auth/:path*'
  ],
}; 