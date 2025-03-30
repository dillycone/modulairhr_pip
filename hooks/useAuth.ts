"use client";

import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
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

type OAuthProvider = 'google' | 'github';

// Process an error into our standard format
const processAuthError = (error: any): AuthError => {
  if (!error) return { message: 'Unknown error', code: 'unknown-error' };
  
  if (typeof error === 'string') {
    return {
      message: error,
      code: error.toLowerCase().includes('configuration') ? 'auth/missing-oauth-credentials' : 'unknown-error',
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
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Set mounted to true - this ensures we only run client-side code
    setMounted(true);

    // Check if environment variables are set to placeholders
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Supabase credentials not configured');
      setState(prev => ({
        ...prev,
        loading: false,
        error: processAuthError('Auth configuration missing')
      }));
      return;
    }
    
    if (supabaseUrl === 'your-supabase-url' || supabaseAnonKey === 'your-supabase-anon-key') {
      console.error('Supabase credentials are set to placeholder values');
      setState(prev => ({
        ...prev,
        loading: false,
        error: processAuthError('Auth configuration incomplete')
      }));
      return;
    }

    // Function to get the current session
    const getInitialSession = async () => {
      try {
        setState(prev => ({ ...prev, loading: true }));
        const { data, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Error getting session:', sessionError);
          setState(prev => ({
            ...prev,
            loading: false,
            error: processAuthError(sessionError)
          }));
          return;
        }

        if (data?.session) {
          setState(prev => ({
            ...prev,
            session: data.session,
            user: data.session.user,
            loading: false,
            error: null
          }));
        } else {
          setState(prev => ({
            ...prev,
            loading: false,
            error: null
          }));
        }
      } catch (error: any) {
        console.error('Unexpected error during session retrieval:', error);
        setState(prev => ({
          ...prev,
          loading: false,
          error: processAuthError(error)
        }));
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
            setState(prev => ({
              ...prev,
              session: newSession,
              user: newSession?.user ?? null,
              loading: false,
              error: null
            }));
          } catch (error: any) {
            console.error('Error in auth state change handler:', error);
            setState(prev => ({
              ...prev,
              error: processAuthError(error)
            }));
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
      setState(prev => ({
        ...prev,
        loading: false,
        error: processAuthError(error)
      }));
      return () => {};
    }
  }, []);

  // User signup function
  const signUp = async (email: string, password: string): Promise<AuthResponse> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const { data, error } = await supabase.auth.signUp({ email, password });
      
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
      
      // Basic credentials
      const credentials = {
        email,
        password
      };
      
      // Handle session length for "Remember Me" functionality
      // We'll handle this with localStorage after login
      
      const { data, error } = await supabase.auth.signInWithPassword(credentials);
      
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
      
      // For "Remember Me" we use the default Supabase behavior (longer session)
      // For "Don't Remember Me" we'll need to implement a custom cookie strategy
      if (!rememberMe && data.session) {
        // Store that this session should expire sooner in local storage
        try {
          localStorage.setItem('session_preference', 'temporary');
          localStorage.setItem('session_start_time', Date.now().toString());
        } catch (e) {
          console.error('Error setting up session expiration:', e);
        }
      } else {
        // Clear any previous temporary session flag
        try {
          localStorage.removeItem('session_preference');
          localStorage.removeItem('session_start_time');
        } catch (e) {
          console.error('Error clearing session preferences:', e);
        }
      }
      
      // Update state with user and session data
      setState(prev => ({
        ...prev,
        user: data.user,
        session: data.session,
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

  // Social sign-in function
  const signInWithOAuth = async (provider: OAuthProvider): Promise<AuthResponse> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      // Generate the OAuth URL and redirect the user
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      
      if (error) {
        console.error('OAuth signin error:', error);
        const processedError = processAuthError(error);
        setState(prev => ({
          ...prev,
          loading: false,
          error: processedError
        }));
        return { data: null, error: processedError };
      }
      
      // No need to update state here as the user will be redirected
      return { data, error: null };
    } catch (error: any) {
      console.error('Unexpected error during OAuth signin:', error);
      const processedError = processAuthError(error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: processedError
      }));
      return { data: null, error: processedError };
    }
  };

  // User signout function
  const signOut = async (): Promise<{ error: AuthError | null }> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      // Clear any session preference data
      try {
        localStorage.removeItem('session_preference');
        localStorage.removeItem('session_start_time');
      } catch (e) {
        console.error('Error clearing session preferences:', e);
      }
      
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
      
      // Clear user and session on successful signout
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

  // Password reset request function
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

  // Update password function
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

  // Check session status - simplified version without setInterval
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
            supabase.auth.signOut();
          }
        }
      }
    } catch (error) {
      console.error('Error checking session status:', error);
    }
  }, [mounted, state.session]);

  // Only return real values when mounted (client-side)
  return {
    user: mounted ? state.user : null,
    session: mounted ? state.session : null,
    loading: state.loading,
    error: state.error,
    signUp,
    signIn,
    signInWithOAuth,
    signOut,
    resetPassword,
    updatePassword,
  };
}; 