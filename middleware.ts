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

export async function middleware(req: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: req.headers,
    },
  });

  try {
    // Create a Supabase client for server-side auth
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return req.cookies.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            // If the cookie is updated, update the response
            response = NextResponse.next({
              request: {
                headers: req.headers,
              },
            });
            response.cookies.set({ name, value, ...options });
          },
          remove(name: string, options: CookieOptions) {
            // If the cookie is removed, update the response
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

    // Refresh session if it exists
    await supabase.auth.getUser();

    // Get the session after potential refresh
    const { data: { session } } = await supabase.auth.getSession();
    const pathname = req.nextUrl.pathname;

    // If user is signed in and trying to access auth pages, redirect to dashboard
    if (session && AUTH_ROUTES.some(route => pathname.startsWith(route))) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    // If user is not signed in and trying to access protected routes, redirect to login
    /*
    if (!session && PROTECTED_ROUTES.some(route => pathname.startsWith(route))) {
      const redirectUrl = req.nextUrl.clone();
      redirectUrl.pathname = '/auth/login';
      // Store the original URL as a redirect parameter
      redirectUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(redirectUrl);
    }
    */

    return response;
  } catch (error) {
    console.error('Middleware error:', error);
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