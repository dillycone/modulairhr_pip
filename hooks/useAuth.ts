"use client";

import { useState, useEffect } from 'react';
import { User, Session, AuthChangeEvent } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

// Auth hook interface
interface AuthError {
  message: string;
  code: string;
  original?: any;
}

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: AuthError | null;
  initialized: boolean;
}

interface SignInOptions {
  email: string;
  password: string;
  rememberMe?: boolean;
}

interface AuthResponse {
  data: any;
  error: AuthError | null;
}

// Process an error into our standard format
const processAuthError = (error: any): AuthError => {
  if (!error) return { message: 'Unknown error', code: 'unknown-error' };
  
  if (typeof error === 'string') {
    return {
      message: error,
      code: error.toLowerCase().includes('configuration') ? 'auth/configuration-error' : 'unknown-error',
    };
  }
  
  return {
    message: error.message || 'Authentication error',
    code: error.code || 'unknown-error',
    original: error
  };
};

export const useAuth = () => {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    error: null,
    initialized: false,
  });
  const [mounted, setMounted] = useState(false);

  // Update auth state in a consistent way
  const updateAuthState = (updates: Partial<AuthState>) => {
    setState(prev => ({
      ...prev,
      ...updates,
      initialized: true,
    }));
  };

  useEffect(() => {
    let authStateSubscription: { subscription?: { unsubscribe: () => void } } = {};

    const initializeAuth = async () => {
      setMounted(true);

      // Check if environment variables are set to placeholders
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseAnonKey) {
        console.error('Supabase credentials not configured');
        updateAuthState({
          loading: false,
          error: processAuthError('Auth configuration missing')
        });
        return;
      }
      
      if (supabaseUrl === 'your-supabase-url' || supabaseAnonKey === 'your-supabase-anon-key') {
        console.error('Supabase credentials are set to placeholder values');
        updateAuthState({
          loading: false,
          error: processAuthError('Auth configuration incomplete')
        });
        return;
      }

      try {
        // Get initial session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Error getting session:', sessionError);
          updateAuthState({
            loading: false,
            error: processAuthError(sessionError)
          });
          return;
        }

        updateAuthState({
          session,
          user: session?.user ?? null,
          loading: false,
          error: null
        });

        // Set up auth state change listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, newSession) => {
            console.log('Auth state changed:', event);
            
            try {
              // Handle different auth events
              switch (event) {
                case 'SIGNED_IN':
                  updateAuthState({
                    session: newSession,
                    user: newSession?.user ?? null,
                    loading: false,
                    error: null
                  });
                  break;
                  
                case 'SIGNED_OUT':
                  updateAuthState({
                    session: null,
                    user: null,
                    loading: false,
                    error: null
                  });
                  // Clear any session-related data
                  try {
                    localStorage.removeItem('session_preference');
                    localStorage.removeItem('session_start_time');
                  } catch (e) {
                    console.error('Error clearing session data:', e);
                  }
                  break;
                  
                case 'USER_UPDATED':
                  updateAuthState({
                    session: newSession,
                    user: newSession?.user ?? null,
                    loading: false,
                    error: null
                  });
                  break;
                  
                case 'TOKEN_REFRESHED':
                  updateAuthState({
                    session: newSession,
                    user: newSession?.user ?? null,
                    loading: false,
                    error: null
                  });
                  break;
                  
                default:
                  updateAuthState({
                    session: newSession,
                    user: newSession?.user ?? null,
                    loading: false,
                    error: null
                  });
              }
            } catch (error: any) {
              console.error('Error in auth state change handler:', error);
              updateAuthState({
                error: processAuthError(error)
              });
            }
          }
        );

        authStateSubscription.subscription = subscription;
      } catch (error: any) {
        console.error('Error initializing auth:', error);
        updateAuthState({
          loading: false,
          error: processAuthError(error)
        });
      }
    };

    initializeAuth();

    // Cleanup function
    return () => {
      try {
        authStateSubscription.subscription?.unsubscribe();
      } catch (error: any) {
        console.error('Error unsubscribing from auth listener:', error);
      }
    };
  }, []);

  // User signup function
  const signUp = async (email: string, password: string): Promise<AuthResponse> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });
      
      if (error) {
        console.error('Signup error:', error);
        const processedError = processAuthError(error);
        setState(prev => ({
          ...prev,
          loading: false,
          error: processedError
        }));
        return { data: null, error: processedError };
      }
      
      setState(prev => ({
        ...prev,
        loading: false,
        error: null
      }));
      return { data, error: null };
    } catch (error: any) {
      console.error('Unexpected error during signup:', error);
      const processedError = processAuthError(error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: processedError
      }));
      return { data: null, error: processedError };
    }
  };

  // User signin function with remember me option
  const signIn = async ({ email, password, rememberMe = false }: SignInOptions): Promise<AuthResponse> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        console.error('Signin error:', error);
        const processedError = processAuthError(error);
        setState(prev => ({
          ...prev,
          loading: false,
          error: processedError
        }));
        return { data: null, error: processedError };
      }

      // Handle session persistence
      if (!rememberMe && data.session) {
        try {
          localStorage.setItem('session_preference', 'temporary');
          localStorage.setItem('session_start_time', Date.now().toString());
        } catch (e) {
          console.error('Error setting up session expiration:', e);
        }
      }
      
      setState(prev => ({
        ...prev,
        loading: false,
        error: null
      }));
      
      return { data, error: null };
    } catch (error: any) {
      console.error('Unexpected error during signin:', error);
      const processedError = processAuthError(error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: processedError
      }));
      return { data: null, error: processedError };
    }
  };

  // Add session check effect
  useEffect(() => {
    if (!mounted || !state.session) return;

    try {
      // Check if this is a temporary session
      const sessionPreference = localStorage.getItem('session_preference');
      if (sessionPreference === 'temporary') {
        const sessionStart = localStorage.getItem('session_start_time');
        if (sessionStart) {
          const sessionAgeMs = Date.now() - parseInt(sessionStart, 10);
          const oneDayMs = 24 * 60 * 60 * 1000;
          
          if (sessionAgeMs > oneDayMs) {
            // Session is older than 1 day, log out
            signOut();
          }
        }
      }
    } catch (error) {
      console.error('Error checking session status:', error);
    }
  }, [mounted, state.session]);


  // Sign out
  const signOut = async (): Promise<{ error: AuthError | null }> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Signout error:', error);
        const processedError = processAuthError(error);
        setState(prev => ({
          ...prev,
          loading: false,
          error: processedError
        }));
        return { error: processedError };
      }
      
      setState(prev => ({
        ...prev,
        user: null,
        session: null,
        loading: false,
        error: null
      }));
      
      return { error: null };
    } catch (error: any) {
      console.error('Unexpected error during signout:', error);
      const processedError = processAuthError(error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: processedError
      }));
      return { error: processedError };
    }
  };

  // Reset password
  const resetPassword = async (email: string): Promise<AuthResponse> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/update-password`,
      });
      
      if (error) {
        console.error('Password reset error:', error);
        const processedError = processAuthError(error);
        setState(prev => ({
          ...prev,
          loading: false,
          error: processedError
        }));
        return { data: null, error: processedError };
      }
      
      setState(prev => ({
        ...prev,
        loading: false,
        error: null
      }));
      
      return { data, error: null };
    } catch (error: any) {
      console.error('Unexpected error during password reset:', error);
      const processedError = processAuthError(error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: processedError
      }));
      return { data: null, error: processedError };
    }
  };

  // Update password
  const updatePassword = async (newPassword: string): Promise<AuthResponse> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      
      if (error) {
        console.error('Update password error:', error);
        const processedError = processAuthError(error);
        setState(prev => ({
          ...prev,
          loading: false,
          error: processedError
        }));
        return { data: null, error: processedError };
      }
      
      setState(prev => ({
        ...prev,
        loading: false,
        error: null
      }));
      
      return { data, error: null };
    } catch (error: any) {
      console.error('Unexpected error during password update:', error);
      const processedError = processAuthError(error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: processedError
      }));
      return { data: null, error: processedError };
    }
  };

  return {
    user: state.user,
    session: state.session,
    loading: state.loading,
    error: state.error,
    initialized: state.initialized,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword
  };
}; 