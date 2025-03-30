import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

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
  const res = NextResponse.next();
  
  try {
    // Check if user has the auth token cookie
    const hasSession = req.cookies.has('sb-auth-token') || 
                      req.cookies.has('supabase-auth-token');
    
    const pathname = req.nextUrl.pathname;
    
    // If user is signed in and trying to access auth pages, redirect to dashboard
    if (hasSession && AUTH_ROUTES.some(route => pathname.startsWith(route))) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
    
    // If user is not signed in and trying to access protected routes, redirect to login
    if (!hasSession && PROTECTED_ROUTES.some(route => pathname.startsWith(route))) {
      return NextResponse.redirect(new URL('/auth/login', req.url));
    }
    
    return res;
  } catch (error) {
    console.error('Middleware error:', error);
    return res;
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