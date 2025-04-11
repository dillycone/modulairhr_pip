// File: lib/supabase/server.ts

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
// Import SupabaseClient type from the core library if needed elsewhere,
// but we won't use it directly for the return type annotation here.
// import { type SupabaseClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import type { Database } from '@/types/supabase' // Adjust path if your generated types are elsewhere
import { type RequestCookies } from 'next/dist/server/web/spec-extension/cookies'

/**
 * Creates a Supabase client for server components
 */
export async function createServerSupabaseClient() {
  const cookieStore = await cookies();
  return createServerComponentClient<Database>({ cookies: () => cookieStore })
}

/**
 * Creates a Supabase client for server components with provided cookies
 */
export function createServerSupabaseClientWithCookies(cookieStore: RequestCookies) {
  return createServerComponentClient<Database>({ cookies: () => cookieStore })
}

// Note: You might also have a createClient() for Client Components
// and createRouteHandlerClient() / createServerActionClient() if needed,
// often placed in separate files like client.ts / route-handler.ts etc.
// But for this specific Server Component ('select-template/page.tsx'),
// this createServerClient function is the one we need. 