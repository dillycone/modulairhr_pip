"use client";

import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '../types/supabase';
import { createClient } from '@supabase/supabase-js';
import { supabaseConfig } from './env';

// Flag to check if we're in browser environment
const isBrowser = typeof window !== 'undefined';

let supabaseClient: ReturnType<typeof createBrowserClient<Database>> | null = null;

/**
 * Creates and returns a configured Supabase client for browser environments.
 * Uses PKCE flow for secure authentication.
 * 
 * Implementation is lazy to avoid execution during SSR.
 */
export const supabase = isBrowser ? getOrCreateClient() : createEmptyClient();

function getOrCreateClient() {
  if (!supabaseClient && isBrowser) {
    supabaseClient = createBrowserClient<Database>(
      supabaseConfig.url,
      supabaseConfig.anonKey,
      {
        auth: {
          flowType: 'pkce',
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: true
        }
      }
    );
  }
  return supabaseClient;
}

// Empty client for SSR that won't cause errors 
function createEmptyClient() {
  // Return a minimal implementation that won't error during SSR
  return {
    auth: {
      getSession: async () => ({ data: { session: null }, error: null }),
      getUser: async () => ({ data: { user: null }, error: null }),
      signInWithPassword: async () => ({ data: { user: null }, error: null }),
      // Add other methods as stubs as needed
    }
  } as unknown as ReturnType<typeof createBrowserClient<Database>>;
}

// Create a single supabase client for interacting with the database
export const supabaseJs = createClient<Database>(
  supabaseConfig.url,
  supabaseConfig.anonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);