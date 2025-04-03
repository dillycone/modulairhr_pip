"use client";

import { createClient } from '@supabase/supabase-js';

// Initialize the Supabase client
const createSupabaseClient = () => {
  // Get environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  // Validate credentials
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Supabase credentials are not set in environment variables');
    throw new Error('Missing Supabase credentials');
  }

  if (supabaseUrl === 'your-supabase-url' || supabaseAnonKey === 'your-supabase-anon-key') {
    console.error('Supabase credentials are set to default placeholders. Update your .env.local file.');
    throw new Error('Invalid Supabase credentials - using placeholders');
  }

  // Create the client
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
              
              if (key === 'supabase.auth.token') {
                const cookies = document.cookie.split(';');
                const authCookie = cookies.find(c => c.trim().startsWith('sb-auth-token='));
                if (authCookie) {
                  const cookieValue = authCookie.split('=')[1];
                  console.log('Retrieved auth token from cookie fallback');
                  return cookieValue;
                }
              }
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
              
              if (key === 'supabase.auth.token') {
                const secureFlag = window.location.protocol === 'https:' ? '; Secure' : '';
                document.cookie = `sb-auth-token=${value}; path=/; max-age=604800; SameSite=Lax${secureFlag}`;
              }
            } catch (error) {
              console.error('Error writing to storage:', error);
              if (key === 'supabase.auth.token') {
                try {
                  const secureFlag = window.location.protocol === 'https:' ? '; Secure' : '';
                  document.cookie = `sb-auth-token=${value}; path=/; max-age=604800; SameSite=Lax${secureFlag}`;
                } catch (cookieError) {
                  console.error('Error writing to cookie fallback:', cookieError);
                }
              }
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
        headers: {
          'X-Client-Info': 'supabase-js-web'
        },
        fetch: (...args) => {
          return fetch(...args).then(async (response) => {
            if (!response.ok) {
              const error = await response.json().catch(() => ({}));
              throw new Error(error.message || `HTTP error! status: ${response.status}`);
            }
            return response;
          }).catch(error => {
            console.error('Fetch error:', error);
            throw error;
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