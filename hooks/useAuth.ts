"use client";

import { useState, useEffect } from 'react';
import { debugLog } from '@/lib/debug';
import { supabase } from '../lib/supabase';
import { translateError } from '@/lib/error-helpers';
import type { User, Session, AuthChangeEvent } from '@supabase/supabase-js';

interface AuthError {
  message: string;
  code: string;
  original?: unknown;
}

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: AuthError | null;
}

interface AuthResponse {
  data: any;
  error: AuthError | null;
}

export const useAuth = () => {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    error: null,
  });

  // Update auth state in a consistent way
  const updateAuthState = (updates: Partial<AuthState>) => {
    setState(prev => ({
      ...prev,
      ...updates,
    }));
    // Add debug logging for auth state updates
    debugLog('Auth state updated:', { 
      ...updates,
      hasUser: !!updates.user,
      userEmail: updates.user?.email,
      hasSession: !!updates.session
    });
  };

  useEffect(() => {
    let authStateSubscription: { subscription?: { unsubscribe: () => void } } = {};

    const initializeAuth = async () => {
      try {
        // getSession, subscribe to changes...
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) {
          debugLog('Error getting session:', sessionError);
          updateAuthState({ loading: false, error: { 
            message: translateError(sessionError), 
            code: 'init-fail', 
            original: sessionError 
          }});
          return;
        }

        updateAuthState({ session, user: session?.user || null, loading: false, error: null });
        debugLog('Auth session established:', { user: session?.user?.email });

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event: AuthChangeEvent, newSession: Session | null) => {
            debugLog('Auth state changed:', event);

            try {
              switch (event) {
                case 'SIGNED_IN':
                  debugLog('SIGNED_IN event');
                  updateAuthState({
                    session: newSession,
                    user: newSession?.user ?? null,
                    loading: false,
                    error: null
                  });
                  break;
                case 'SIGNED_OUT':
                  debugLog('SIGNED_OUT event');
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

                default:
                  debugLog('Auth event:', event);
                  updateAuthState({
                    session: newSession,
                    user: newSession?.user ?? null,
                    loading: false,
                    error: null
                  });
              }
            } catch (error: unknown) {
              const msg = translateError(error);
              debugLog('Error in auth state change handler:', msg);
              updateAuthState({ 
                error: { message: msg, code: 'auth-change', original: error }
              });
            }
          }
        );

        authStateSubscription.subscription = subscription;
      } catch (error: unknown) {
        const msg = translateError(error);
        updateAuthState({ loading: false, error: { message: msg, code: 'init-fail', original: error }});
        debugLog('Error initializing auth:', msg);
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

  // Sign in
  const signIn = async (opts: { email: string; password: string }): Promise<AuthResponse> => {
    try {
      debugLog('Sign in started for:', opts.email);
      updateAuthState({ loading: true, error: null });

      // Attempt sign in
      const { data, error } = await supabase.auth.signInWithPassword({
        email: opts.email,
        password: opts.password
      });
      if (error) {
        const processed = { message: translateError(error), code: 'signin-fail', original: error };
        debugLog('Signin error:', error);
        updateAuthState({ loading: false, error: processed });
        return { data: null, error: processed };
      }

      // refresh session data
      const { data: refreshData } = await supabase.auth.getSession();
      updateAuthState({
        user: refreshData?.session?.user || data?.user || null,
        session: refreshData?.session || data?.session || null,
        loading: false,
        error: null
      });
      return { data, error: null };
    } catch (error: any) {
      const processed = { message: translateError(error), code: 'signin-fail' };
      updateAuthState({ loading: false, error: processed });
      return { data: null, error: processed };
    }
  };

  // Sign up
  const signUp = async (email: string, password: string): Promise<AuthResponse> => {
    try {
      debugLog('Sign up started for:', email);
      updateAuthState({ loading: true, error: null });

      // Attempt sign up
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin + '/auth/callback',
        },
      });

      if (error) {
        const processed = { message: translateError(error), code: 'signup-fail', original: error };
        debugLog('Signup error:', error);
        updateAuthState({ loading: false, error: processed });
        return { data: null, error: processed };
      }

      // signUp typically requires email confirmation; session may be null
      updateAuthState({
        user: data.user ?? null,
        session: data.session ?? null,
        loading: false,
        error: null
      });
      return { data, error: null };
    } catch (error: any) {
      const processed = { message: translateError(error), code: 'signup-fail' };
      updateAuthState({ loading: false, error: processed });
      return { data: null, error: processed };
    }
  };

  // Sign out
  const signOut = async (): Promise<{ error: AuthError | null }> => {
    try {
      updateAuthState({ loading: true, error: null });

      const { error } = await supabase.auth.signOut();
      if (error) {
        const processedError = { message: translateError(error), code: 'signout-fail' };
        updateAuthState({ loading: false, error: processedError });
        return { error: processedError };
      }

      updateAuthState({
        user: null,
        session: null,
        loading: false,
        error: null
      });
      return { error: null };
    } catch (error: any) {
      const processedError = { message: translateError(error), code: 'signout-fail' };
      updateAuthState({ loading: false, error: processedError });
      return { error: processedError };
    }
  };

  /**
   * Send a password reset email.
   * This triggers a link to be sent to the user, with Supabase's built-in flow.
   */
  const resetPassword = async (email: string): Promise<AuthResponse> => {
    try {
      updateAuthState({ loading: true, error: null });
      debugLog('Resetting password via email for:', email);

      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/auth/update-password'
      });

      if (error) {
        const processedError = { message: translateError(error), code: 'reset-fail', original: error };
        updateAuthState({ loading: false, error: processedError });
        return { data: null, error: processedError };
      }

      updateAuthState({ loading: false, error: null });
      return { data, error: null };
    } catch (error: any) {
      const processedError = { message: translateError(error), code: 'reset-fail', original: error };
      debugLog('Error resetting password:', processedError);
      updateAuthState({ loading: false, error: processedError });
      return { data: null, error: processedError };
    }
  };

  /**
   * Update the user password if they already have a session (e.g. from a reset link).
   */
  const updatePassword = async (newPassword: string): Promise<AuthResponse> => {
    try {
      updateAuthState({ loading: true, error: null });
      debugLog('Updating user password...');

      const { data, error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
        const processedError = { message: translateError(error), code: 'update-password-fail', original: error };
        updateAuthState({ loading: false, error: processedError });
        return { data: null, error: processedError };
      }

      // Re-fetch session after update
      const { data: fresh } = await supabase.auth.getSession();
      updateAuthState({
        user: fresh.session?.user ?? data?.user ?? null,
        session: fresh.session ?? null,
        loading: false,
        error: null
      });

      return { data, error: null };
    } catch (error: any) {
      const processedError = { message: translateError(error), code: 'update-password-fail' };
      debugLog('Error updating password:', processedError);
      updateAuthState({ loading: false, error: processedError });
      return { data: null, error: processedError };
    }
  };

  // Return all auth methods and state
  return {
    user: state.user,
    session: state.session,
    loading: state.loading,
    error: state.error,
    signIn,
    signOut,
    signUp,
    resetPassword,
    updatePassword,
  };
} 