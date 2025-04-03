import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { checkBypassCookie } from '@/lib/utils';

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

    // If we have a dev bypass cookie, skip protected checks:
    if (checkBypassCookie()) {
      console.log('Bypass cookie found, allowing dev access');
      return response;
    }

    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) {
      console.error('Error getting session:', error);
      // Could do additional logic, or just let the route pass and rely on client
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