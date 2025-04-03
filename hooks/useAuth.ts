"use client";

import { useState, useEffect } from 'react';
import { debugLog } from '@/lib/debug';
import { User, Session, AuthChangeEvent } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { translateError } from '@/lib/error-helpers';

// Auth hook interface
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
      setMounted(true);

      // We do not do environment placeholder checks anymore
      // That logic is in lib/supabase.ts
      try {
        // getSession, subscription, ...
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) {
          debugLog('Error getting session:', sessionError);
          updateAuthState({ loading: false, error: { message: translateError(sessionError), code: 'init-fail', original: sessionError }});
          return;
        }
        updateAuthState({ session, user: session?.user || null, loading: false, error: null });
        debugLog('Auth session established:', { user: session?.user?.email });

        // onAuthStateChange...
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event: AuthChangeEvent, newSession: Session | null) => {
            debugLog('Auth state changed:', event);
            
            try {
              // Handle different auth events
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
                  
                case 'TOKEN_REFRESHED':
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
              // unify error
              const msg = translateError(error);
              debugLog('Error in auth state change handler:', msg);
              updateAuthState({ error: { message: msg, code: 'auth-change', original: error }});
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
        const processedError = { message: translateError(error), code: 'signup-fail' };
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
      const processedError = { message: translateError(error), code: 'signup-fail' };
      setState(prev => ({
        ...prev,
        loading: false,
        error: processedError
      }));
      return { data: null, error: processedError };
    }
  };

  // Sign in
  const signIn = async ({ email, password, rememberMe }: SignInOptions): Promise<AuthResponse> => {
    // We rely on supabase's "persistSession" for remember-me style
    // If you want ephemeral sessions, you'd set "persistSession: false" or handle it differently
    try {
      debugLog('Sign in started for:', email);
      updateAuthState({ loading: true, error: null });
      // Sign out local scope if needed...
      await supabase.auth.signOut({ scope: 'local' });

      // Attempt sign in with supabase
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        const processed = { message: translateError(error), code: 'signin-fail', original: error };
        debugLog('Signin error:', error);
        updateAuthState({ loading: false, error: processed });
        return { data: null, error: processed };
      }

      // Done - refresh session data if needed
      const { data: refreshData } = await supabase.auth.getSession();
      updateAuthState({
        user: refreshData?.session?.user || data?.user || null,
        session: refreshData?.session || data?.session || null,
        loading: false,
        error: null
      });
      return { data, error: null };
    } catch (error: any) {
      console.error('Unexpected error during signin:', error);
      const processedError = { message: translateError(error), code: 'signin-fail' };
      updateAuthState({ loading: false, error: processedError });
      return { data: null, error: processedError };
    }
  };

  // Sign out
  const signOut = async (): Promise<{ error: AuthError | null }> => {
    try {
      updateAuthState({ loading: true, error: null });
      const { error: signoutError } = await supabase.auth.signOut({ scope: 'global' });
      if (signoutError) {
        debugLog('Signout error:', signoutError);
        const processedError = { message: translateError(signoutError), code: 'signout-fail', original: signoutError };
        updateAuthState({ loading: false, error: processedError });
        return { error: processedError };
      }
      debugLog('User signed out globally');
      updateAuthState({ user: null, session: null, loading: false, error: null });
      return { error: null };
    } catch (error: any) {
      console.error('Unexpected error during signout:', error);
      const processedError = { message: translateError(error), code: 'signout-fail' };
      updateAuthState({ loading: false, error: processedError });
      return { error: processedError };
    }
  };

  // Reset password
  const resetPassword = async (email: string): Promise<AuthResponse> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      debugLog(`Resetting password for: ${email}`);
      
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/update-password`,
      });
      
      if (error) {
        console.error('Password reset error:', error);
        const processedError = { message: translateError(error), code: 'reset-password-fail' };
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
      const processedError = { message: translateError(error), code: 'reset-password-fail' };
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
      debugLog('Updating password');
      
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      
      if (error) {
        console.error('Update password error:', error);
        const processedError = { message: translateError(error), code: 'update-password-fail' };
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
      const processedError = { message: translateError(error), code: 'update-password-fail' };
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
    resetPassword, // also simplified
    updatePassword // also simplified
  };
}; 