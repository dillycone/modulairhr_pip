"use client";

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '../types/supabase';

/**
 * Creates and returns a configured Supabase client using cookie-based sessions.
 * This client is for client-side components.
 */
export const supabase = createClientComponentClient<Database>({
  auth: {
    flowType: 'pkce',
    onAuthStateChange: (event, session) => {
      // Custom callback for auth state changes
    },
    emailRedirectTo: `${typeof window !== 'undefined' ? window.location.origin : ''}/auth/callback`,
    cookieOptions: {
      name: 'devpip-auth',
      lifetime: 60 * 60 * 8, // 8 hours
      sameSite: 'lax',
      secure: true
    }
  }
}); 