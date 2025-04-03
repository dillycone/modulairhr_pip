import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

const PROTECTED_ROUTES = [
  '/dashboard',
  '/profile',
  '/settings'
];

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  let response = NextResponse.next({ request: { headers: req.headers } });
  console.log(`Middleware processing: ${pathname}`);

  try {
    // If dev environment, optionally allow dev bypass
    if (process.env.NODE_ENV === 'development') {
      console.log('Dev environment: we skip or lighten auth checks if desired');
    }

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            const cookie = req.cookies.get(name);
            return cookie?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            response.cookies.set({ name, value, ...options });
          },
          remove(name: string, options: CookieOptions) {
            response.cookies.set({ name, value: '', ...options });
          },
        },
      }
    );

    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) {
      console.error('Error getting session:', error);
    }

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
