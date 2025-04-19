"use client";

import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/types/supabase';

/**
 * Creates and returns a configured Supabase client for browser environments.
 * Uses PKCE flow for secure authentication.
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        flowType: 'pkce',
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        storageKey: 'sb-auth-token',
        storage: {
          getItem: (key) => {
            try {
              return localStorage.getItem(key);
            } catch (error) {
              // In case of localStorage access issues (Safari private mode)
              console.warn('Error accessing localStorage:', error);
              return null;
            }
          },
          setItem: (key, value) => {
            try {
              localStorage.setItem(key, value);
            } catch (error) {
              console.warn('Error writing to localStorage:', error);
            }
          },
          removeItem: (key) => {
            try {
              localStorage.removeItem(key);
            } catch (error) {
              console.warn('Error removing from localStorage:', error);
            }
          }
        }
      }
    }
  );
} 