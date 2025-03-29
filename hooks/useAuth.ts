import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Set mounted to true - this ensures we only run client-side code
    setMounted(true);

    // Check if environment variables are set to placeholders
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Supabase credentials not configured');
      setError('Auth configuration missing');
      setLoading(false);
      return;
    }
    
    if (supabaseUrl === 'your-supabase-url' || supabaseAnonKey === 'your-supabase-anon-key') {
      console.error('Supabase credentials are set to placeholder values');
      setError('Auth configuration incomplete');
      setLoading(false);
      return;
    }

    // Function to get the current session
    const getInitialSession = async () => {
      try {
        setLoading(true);
        const { data, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Error getting session:', sessionError);
          setError(sessionError.message);
          return;
        }

        if (data?.session) {
          setSession(data.session);
          setUser(data.session.user);
        }
      } catch (error: any) {
        console.error('Unexpected error during session retrieval:', error);
        setError(error.message || 'Unknown error during authentication');
      } finally {
        setLoading(false);
      }
    };

    // Get the initial session
    getInitialSession();

    // Set up the auth state listener
    try {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, newSession) => {
          try {
            console.log('Auth state changed:', event);
            setSession(newSession);
            setUser(newSession?.user ?? null);
            setLoading(false);
          } catch (error: any) {
            console.error('Error in auth state change handler:', error);
            setError(error.message || 'Error updating authentication state');
          }
        }
      );

      // Clean up the subscription when the component unmounts
      return () => {
        try {
          subscription?.unsubscribe();
        } catch (error: any) {
          console.error('Error unsubscribing from auth listener:', error);
        }
      };
    } catch (error: any) {
      console.error('Error setting up auth listener:', error);
      setError(error.message || 'Failed to initialize authentication');
      setLoading(false);
      return () => {};
    }
  }, []);

  // User signup function
  const signUp = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signUp({ email, password });
      
      if (error) {
        console.error('Signup error:', error);
        setError(error.message);
        throw error;
      }
      
      return { data, error: null };
    } catch (error: any) {
      console.error('Unexpected error during signup:', error);
      setError(error.message || 'Error during signup');
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  // User signin function
  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      });
      
      if (error) {
        console.error('Signin error:', error);
        setError(error.message);
        throw error;
      }
      
      return { data, error: null };
    } catch (error: any) {
      console.error('Unexpected error during signin:', error);
      setError(error.message || 'Error during login');
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  // User signout function
  const signOut = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Signout error:', error);
        setError(error.message);
        throw error;
      }
      
      // Clear user and session on successful signout
      setUser(null);
      setSession(null);
      
      return { error: null };
    } catch (error: any) {
      console.error('Unexpected error during signout:', error);
      setError(error.message || 'Error during sign out');
      return { error };
    } finally {
      setLoading(false);
    }
  };

  // Only return real values when mounted (client-side)
  return {
    user: mounted ? user : null,
    session: mounted ? session : null,
    loading,
    error,
    signUp,
    signIn,
    signOut,
  };
}; 