import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/supabase';
import { type RequestCookies } from 'next/dist/server/web/spec-extension/cookies';

/**
 * Creates a Supabase client for use in Server Components.
 * This uses cookies to maintain the session.
 */
export async function createServerSupabaseClient() {
  const cookieStore = cookies();
  return createServerComponentClient<Database>({ 
    cookies: () => cookieStore,
    options: {
      auth: {
        flowType: 'pkce',
        cookieOptions: {
          name: 'devpip-auth',
          lifetime: 60 * 60 * 8, // 8 hours
          sameSite: 'lax',
          secure: true
        }
      }
    }
  });
}

/**
 * Creates a Supabase client with provided cookies for use in Server Components.
 */
export function createServerSupabaseClientWithCookies(cookieStore: RequestCookies) {
  return createServerComponentClient<Database>({ 
    cookies: () => cookieStore,
    options: {
      auth: {
        flowType: 'pkce',
        cookieOptions: {
          name: 'devpip-auth',
          lifetime: 60 * 60 * 8, // 8 hours
          sameSite: 'lax',
          secure: true
        }
      }
    }
  });
} 