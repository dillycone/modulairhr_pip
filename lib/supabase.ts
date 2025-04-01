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
        // Better cookie settings for cross-domain authentication
        cookieOptions: {
          name: 'sb-auth-token',
          lifetime: 60 * 60 * 24 * 7, // 7 days
          // domain: process.env.NODE_ENV === 'production' ? 'pipassistant.com' : undefined, // Let browser default domain
          path: '/',
          sameSite: 'lax'
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