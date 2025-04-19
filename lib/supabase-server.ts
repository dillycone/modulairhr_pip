"use server";

import { createServerClient } from '@supabase/ssr';
import type { Database } from '@/types/supabase';
import { type RequestCookies } from 'next/dist/server/web/spec-extension/cookies';
import { NextRequest } from 'next/server';

// Dynamically import cookies from next/headers in a try-catch
// This will work in App Router and fail silently in Pages Router
let cookiesModule: { cookies: () => RequestCookies } | null = null;
try {
  // Dynamic import to avoid static analysis during build
  cookiesModule = require('next/headers');
} catch (e) {
  console.log('next/headers not available (likely in Pages Router)');
}

/**
 * Creates a Supabase client for use in Server Components.
 * This uses cookies to maintain the session.
 * 
 * @param options Optional object containing request for Pages Router compatibility
 */
export async function createServerSupabaseClient(options?: { req?: NextRequest }) {
  // If we're in pages router, use the provided request
  if (options?.req) {
    const { cookies } = options.req;
    return createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookies.get(name)?.value;
          },
          set() {
            // Not needed for read-only operations in middleware/api routes
          },
          remove() {
            // Not needed for read-only operations in middleware/api routes
          },
        },
      }
    );
  }

  // If we're in app router, use the next/headers module
  if (cookiesModule?.cookies) {
    return createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          async get(name: string) {
            const cookieStore = await cookiesModule!.cookies();
            const cookie = await cookieStore.get(name);
            return cookie?.value;
          },
          async set(name: string, value: string, options: any) {
            const cookieStore = await cookiesModule!.cookies();
            cookieStore.set({ name, value, ...options });
          },
          async remove(name: string, options: any) {
            const cookieStore = await cookiesModule!.cookies();
            cookieStore.set({ name, value: "", ...options });
          },
        },
      }
    );
  }

  // Fallback case - use a minimal cookies implementation
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: () => undefined,
        set: () => {},
        remove: () => {},
      },
    }
  );
}

/**
 * Creates a Supabase client with provided cookies for middleware or other server contexts.
 * @param cookiesOrRequest Either a RequestCookies object or a NextRequest
 */
export async function createServerSupabaseClientWithCookies(cookiesOrRequest: RequestCookies | NextRequest) {
  // Extract cookies if a NextRequest was provided
  const cookieStore = 'cookies' in cookiesOrRequest 
    ? cookiesOrRequest.cookies 
    : cookiesOrRequest;

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          cookieStore.set({ name, value: "", ...options });
        },
      },
    }
  );
}