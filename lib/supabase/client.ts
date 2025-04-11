// File: lib/supabase/client.ts

import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/types/supabase' // Adjust path if needed

export const createClient = () => {
  // Simple client creation that uses default cookie handling
  return createBrowserClient<Database>( 
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
} 