// Server-side session management
// No "use client" directive so this is safe to use in server components

import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

// Default empty response
const emptyResponse = {
  data: { session: null },
  error: null
};

/**
 * Get current session from a Supabase client
 * Server-safe version without localStorage or browser APIs
 */
export async function getServerSession(supabase: SupabaseClient<Database>) {
  try {
    // Check for null supabase client
    if (!supabase || !supabase.auth) {
      console.error('Supabase client not available during getSession');
      return emptyResponse;
    }
    
    // Get the current session without refreshing
    return await supabase.auth.getSession();
  } catch (e) {
    console.error('Unexpected error getting session:', e);
    return { 
      data: { session: null }, 
      error: e 
    };
  }
}

/**
 * Attempt to refresh the session
 * Server-safe version without localStorage or browser APIs
 */
export async function refreshServerSession(supabase: SupabaseClient<Database>) {
  try {
    console.log('Refreshing session from server component...');
    
    // Check for null supabase client
    if (!supabase || !supabase.auth) {
      console.error('Supabase client not available during refresh');
      return emptyResponse;
    }
    
    return await supabase.auth.refreshSession();
  } catch (e) {
    console.error('Unexpected error during session refresh:', e);
    return { 
      data: { session: null }, 
      error: e 
    };
  }
} 