import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Define a dummy client type that mimics the Supabase client structure
type DummyClient = {
  auth: {
    getSession: () => Promise<{ data: { session: null }, error: null }>;
    onAuthStateChange: () => { data: { subscription: { unsubscribe: () => void } }, error: null };
    signUp: () => Promise<{ data: null, error: { message: string } }>;
    signIn: () => Promise<{ data: null, error: { message: string } }>;
    signInWithPassword: () => Promise<{ data: null, error: { message: string } }>;
    signOut: () => Promise<{ error: null }>;
  };
};

// Create a dummy client for server-side rendering
function createDummyClient(): DummyClient {
  console.warn('Using dummy Supabase client (SSR)');
  return {
    auth: {
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({ 
        data: { subscription: { unsubscribe: () => {} } }, 
        error: null 
      }),
      signUp: () => Promise.resolve({ 
        data: null, 
        error: { message: 'Auth not available on server' } 
      }),
      signIn: () => Promise.resolve({ 
        data: null, 
        error: { message: 'Auth not available on server' } 
      }),
      signInWithPassword: () => Promise.resolve({ 
        data: null, 
        error: { message: 'Auth not available on server' } 
      }),
      signOut: () => Promise.resolve({ error: null }),
    },
  };
}

// Create a function to initialize the Supabase client
function initSupabaseClient(): SupabaseClient | DummyClient {
  // Return dummy client for server-side rendering
  if (typeof window === 'undefined') {
    return createDummyClient();
  }

  // Get environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Validate environment variables
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase credentials');
    return createDummyClient();
  }

  try {
    // Validate URL format to prevent "cannot be parsed as URL" errors
    new URL(supabaseUrl);
    
    // Create the real client
    console.log('Initializing real Supabase client');
    return createClient(supabaseUrl, supabaseAnonKey);
  } catch (error) {
    console.error('Failed to initialize Supabase client:', error);
    return createDummyClient();
  }
}

// Export a single instance of the client
const supabase = initSupabaseClient();

export { supabase }; 