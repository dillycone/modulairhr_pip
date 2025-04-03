"use client";

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/supabase';

/**
 * Creates and returns a configured Supabase client using cookie-based sessions.
 * This client is for client-side components.
 */
export const supabase = createClientComponentClient<Database>();

// Utility function to update autoRefreshToken setting
export function updateAutoRefreshToken(enabled: boolean) {
  try {
    // @ts-ignore - accessing internal property of the client
    if (supabase.auth && typeof supabase.auth.autoRefreshToken !== 'undefined') {
      console.log(`Setting autoRefreshToken to: ${enabled}`);
      // @ts-ignore - modifying internal property
      supabase.auth.autoRefreshToken = enabled;
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error updating autoRefreshToken setting:', error);
    return false;
  }
} 