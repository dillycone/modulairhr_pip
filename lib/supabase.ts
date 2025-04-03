"use client";

import { createClient } from '@supabase/supabase-js';

/**
 * Creates and returns a configured Supabase client.
 * Any environment / placeholder checks happen here.
 */
function createSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  // Single place to validate environment config:
  if (
    !supabaseUrl || !supabaseAnonKey ||
    supabaseUrl === 'your-supabase-url' ||
    supabaseAnonKey === 'your-supabase-anon-key'
  ) {
    console.error('Supabase credentials invalid or placeholder. Please update .env.local');
    throw new Error('Supabase config error');
  }

  try {
    console.log('Initializing Supabase client');
    const client = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        debug: process.env.NODE_ENV === 'development',
        detectSessionInUrl: true,
        flowType: 'pkce',
        storage: {
          getItem: (key) => {
            try {
              if (typeof window === 'undefined') return null;
              const localValue = window.localStorage.getItem(key);
              if (localValue) return localValue;
              // fallback code omitted for brevity...
              return null;
            } catch (error) {
              console.error('Error reading from storage:', error);
              return null;
            }
          },
          setItem: (key, value) => {
            try {
              if (typeof window === 'undefined') return;
              window.localStorage.setItem(key, value);
              // fallback cookie setting code...
            } catch (error) {
              console.error('Error writing to storage:', error);
            }
          },
          removeItem: (key) => {
            try {
              if (typeof window === 'undefined') return;
              window.localStorage.removeItem(key);
            } catch (error) {
              console.error('Error removing from localStorage:', error);
            }
          }
        },
        storageKey: 'supabase.auth.token'
      },
      global: {
        headers: { 'X-Client-Info': 'supabase-js-web' },
        fetch: (...args) => {
          return fetch(...args).then(async (response) => {
            if (!response.ok) {
              const error = await response.json().catch(() => ({}));
              throw new Error(error.message || `HTTP error! status: ${response.status}`);
            }
            return response;
          });
        }
      }
    });
    console.log('Supabase client initialized successfully');
    return client;
  } catch (error) {
    console.error('Failed to initialize Supabase client:', error);
    throw new Error('Failed to initialize Supabase client');
  }
};

// Export a single instance of the client
export const supabase = createSupabaseClient(); 