import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse, type NextRequest } from 'next/server';

const PROTECTED_ROUTES = [
  '/dashboard',
  '/dashboard/create-pip',
  '/profile',
  '/settings'
];

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  let response = NextResponse.next();
  console.log(`Middleware processing: ${pathname}`);

  try {
    // If dev environment, optionally allow dev bypass
    if (process.env.NODE_ENV === 'development') {
      console.log('Dev environment: we skip or lighten auth checks if desired');
    }

    // Create a Supabase client configured to use cookies
    const supabase = createMiddlewareClient({ req, res: response });

    // This updates the session cookie if it exists and is expired
    const { data: { session } } = await supabase.auth.getSession();

    if (!session && PROTECTED_ROUTES.some(route => pathname.startsWith(route))) {
      console.log(`No session for protected route: ${pathname}, redirecting`);
      const redirectUrl = new URL('/auth/login', req.url);
      redirectUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(redirectUrl);
    }

    return response;
  } catch (error) {
    console.error('Middleware error:', error);
    return response;
  }
}

export const config = {
  matcher: ['/dashboard/:path*','/profile/:path*','/settings/:path*','/auth/:path*'],
};
