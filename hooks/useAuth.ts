"use client";

import { useState, useEffect } from 'react';
import { debugLog } from '@/lib/debug';
import { supabase } from '@/lib/supabase';
import { translateError } from '@/lib/error-helpers';
import type { User, Session, AuthChangeEvent } from '@supabase/supabase-js';

// Define error codes for specific authentication operations
export enum AuthErrorCode {
  // Session-related errors
  SESSION_INIT_FAILED = 'session-init-failed',
  SESSION_FETCH_FAILED = 'session-fetch-failed',
  SESSION_EXPIRED = 'session-expired',
  
  // Sign-in related errors
  SIGNIN_INVALID_CREDENTIALS = 'signin-invalid-credentials',
  SIGNIN_USER_NOT_FOUND = 'signin-user-not-found',
  SIGNIN_EMAIL_NOT_CONFIRMED = 'signin-email-not-confirmed',
  SIGNIN_RATE_LIMITED = 'signin-rate-limited',
  SIGNIN_GENERIC_ERROR = 'signin-generic-error',
  
  // Sign-up related errors
  SIGNUP_EMAIL_IN_USE = 'signup-email-in-use',
  SIGNUP_INVALID_EMAIL = 'signup-invalid-email',
  SIGNUP_WEAK_PASSWORD = 'signup-weak-password',
  SIGNUP_GENERIC_ERROR = 'signup-generic-error',
  
  // Sign-out related errors
  SIGNOUT_FAILED = 'signout-failed',
  
  // Password reset related errors
  PASSWORD_RESET_FAILED = 'password-reset-failed',
  PASSWORD_UPDATE_FAILED = 'password-update-failed',
  
  // Generic errors
  NETWORK_ERROR = 'network-error',
  UNKNOWN_ERROR = 'unknown-error',
  AUTH_STATE_CHANGE_ERROR = 'auth-state-change-error'
}

// Base interface for all auth errors
interface AuthErrorBase {
  message: string;
  code: AuthErrorCode;
  original?: unknown;
}

// Specific error types
interface SessionError extends AuthErrorBase {
  code: AuthErrorCode.SESSION_INIT_FAILED | 
        AuthErrorCode.SESSION_FETCH_FAILED | 
        AuthErrorCode.SESSION_EXPIRED;
}

interface SignInError extends AuthErrorBase {
  code: AuthErrorCode.SIGNIN_INVALID_CREDENTIALS | 
        AuthErrorCode.SIGNIN_USER_NOT_FOUND | 
        AuthErrorCode.SIGNIN_EMAIL_NOT_CONFIRMED |
        AuthErrorCode.SIGNIN_RATE_LIMITED |
        AuthErrorCode.SIGNIN_GENERIC_ERROR;
  email?: string;
}

interface SignUpError extends AuthErrorBase {
  code: AuthErrorCode.SIGNUP_EMAIL_IN_USE | 
        AuthErrorCode.SIGNUP_INVALID_EMAIL | 
        AuthErrorCode.SIGNUP_WEAK_PASSWORD |
        AuthErrorCode.SIGNUP_GENERIC_ERROR;
  email?: string;
}

interface PasswordError extends AuthErrorBase {
  code: AuthErrorCode.PASSWORD_RESET_FAILED | 
        AuthErrorCode.PASSWORD_UPDATE_FAILED;
  email?: string;
}

interface GenericError extends AuthErrorBase {
  code: AuthErrorCode.NETWORK_ERROR | 
        AuthErrorCode.UNKNOWN_ERROR |
        AuthErrorCode.AUTH_STATE_CHANGE_ERROR |
        AuthErrorCode.SIGNOUT_FAILED;
}

// Union type for all auth errors
export type AuthError = SessionError | SignInError | SignUpError | PasswordError | GenericError;

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

// Helper function to map Supabase errors to our custom error types
const mapSupabaseError = (error: any, context: string): AuthError => {
  if (!error) {
    return {
      message: 'An unknown error occurred',
      code: AuthErrorCode.UNKNOWN_ERROR
    };
  }

  // Extract error message from Supabase error
  const errorMessage = translateError(error);
  const errorCode = error.code || '';
  
  // Map context and error to specific error types
  switch (context) {
    case 'signin':
      if (errorMessage.includes('Invalid login credentials')) {
        return {
          message: 'The email or password you entered is incorrect',
          code: AuthErrorCode.SIGNIN_INVALID_CREDENTIALS,
          original: error,
          email: error.email
        };
      } else if (errorMessage.includes('Email not confirmed')) {
        return {
          message: 'Please confirm your email address before signing in',
          code: AuthErrorCode.SIGNIN_EMAIL_NOT_CONFIRMED,
          original: error,
          email: error.email
        };
      } else if (errorMessage.includes('rate limit')) {
        return {
          message: 'Too many sign-in attempts. Please try again later',
          code: AuthErrorCode.SIGNIN_RATE_LIMITED,
          original: error
        };
      } else {
        return {
          message: errorMessage || 'Failed to sign in',
          code: AuthErrorCode.SIGNIN_GENERIC_ERROR,
          original: error
        };
      }
      
    case 'signup':
      if (errorMessage.includes('already in use') || errorMessage.includes('already registered')) {
        return {
          message: 'This email is already registered',
          code: AuthErrorCode.SIGNUP_EMAIL_IN_USE,
          original: error,
          email: error.email
        };
      } else if (errorMessage.includes('valid email')) {
        return {
          message: 'Please enter a valid email address',
          code: AuthErrorCode.SIGNUP_INVALID_EMAIL,
          original: error,
          email: error.email
        };
      } else if (errorMessage.includes('password') && errorMessage.includes('strong')) {
        return {
          message: 'Please use a stronger password',
          code: AuthErrorCode.SIGNUP_WEAK_PASSWORD,
          original: error
        };
      } else {
        return {
          message: errorMessage || 'Failed to create account',
          code: AuthErrorCode.SIGNUP_GENERIC_ERROR,
          original: error
        };
      }
      
    case 'reset-password':
      return {
        message: errorMessage || 'Failed to send password reset email',
        code: AuthErrorCode.PASSWORD_RESET_FAILED,
        original: error,
        email: error.email
      };
      
    case 'update-password':
      return {
        message: errorMessage || 'Failed to update password',
        code: AuthErrorCode.PASSWORD_UPDATE_FAILED,
        original: error
      };
      
    case 'session':
      return {
        message: errorMessage || 'Session error',
        code: AuthErrorCode.SESSION_INIT_FAILED,
        original: error
      };
      
    case 'signout':
      return {
        message: errorMessage || 'Failed to sign out',
        code: AuthErrorCode.SIGNOUT_FAILED,
        original: error
      };
      
    default:
      if (errorMessage.includes('network') || errorCode.includes('network')) {
        return {
          message: 'Network error. Please check your internet connection',
          code: AuthErrorCode.NETWORK_ERROR,
          original: error
        };
      } else {
        return {
          message: errorMessage || 'An unknown error occurred',
          code: AuthErrorCode.UNKNOWN_ERROR,
          original: error
        };
      }
  }
};

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
    let mounted = true;
    let authStateSubscription: { data?: { subscription: { unsubscribe: () => void } } } = {};

    const initializeAuth = async () => {
      try {
        // Get the initial session from cookies
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) {
          debugLog('Error getting session:', sessionError);
          if (mounted) {
            updateAuthState({ 
              loading: false, 
              error: mapSupabaseError(sessionError, 'session')
            });
          }
          return;
        }

        if (mounted) {
          updateAuthState({ session, user: session?.user || null, loading: false, error: null });
        }
        debugLog('Auth session established:', { user: session?.user?.email });

        // Subscribe to auth changes
        authStateSubscription = supabase.auth.onAuthStateChange(
          async (event: AuthChangeEvent, newSession: Session | null) => {
            debugLog('Auth state changed:', event);

            try {
              switch (event) {
                case 'SIGNED_IN':
                  debugLog('SIGNED_IN event');
                  if (mounted) {
                    updateAuthState({
                      session: newSession,
                      user: newSession?.user ?? null,
                      loading: false,
                      error: null
                    });
                  }
                  break;
                case 'SIGNED_OUT':
                  debugLog('SIGNED_OUT event');
                  if (mounted) {
                    updateAuthState({
                      session: null,
                      user: null,
                      loading: false,
                      error: null
                    });
                  }
                  break;
                case 'USER_UPDATED':
                  if (mounted) {
                    updateAuthState({
                      session: newSession,
                      user: newSession?.user ?? null,
                      loading: false,
                      error: null
                    });
                  }
                  break;
                case 'TOKEN_REFRESHED':
                  if (mounted) {
                    updateAuthState({
                      session: newSession,
                      user: newSession?.user ?? null,
                      loading: false,
                      error: null
                    });
                  }
                  break;
                default:
                  debugLog('Auth event:', event);
                  if (mounted) {
                    updateAuthState({
                      session: newSession,
                      user: newSession?.user ?? null,
                      loading: false,
                      error: null
                    });
                  }
              }
            } catch (error: unknown) {
              debugLog('Error in auth state change handler:', error);
              if (mounted) {
                updateAuthState({ 
                  error: mapSupabaseError(error, 'auth-state-change') 
                });
              }
            }
          }
        );
      } catch (error: unknown) {
        if (mounted) {
          updateAuthState({ 
            loading: false, 
            error: mapSupabaseError(error, 'session')
          });
        }
        debugLog('Error initializing auth:', error);
      }
    };

    initializeAuth();

    // Cleanup function
    return () => {
      mounted = false;
      try {
        authStateSubscription.data?.subscription?.unsubscribe();
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
        const processed = mapSupabaseError(error, 'signin');
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
      const processed = mapSupabaseError(error, 'signin');
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
        const processed = mapSupabaseError(error, 'signup');
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
      const processed = mapSupabaseError(error, 'signup');
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
        const processedError = mapSupabaseError(error, 'signout');
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
      const processedError = mapSupabaseError(error, 'signout');
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
        const processedError = mapSupabaseError(error, 'reset-password');
        updateAuthState({ loading: false, error: processedError });
        return { data: null, error: processedError };
      }

      updateAuthState({ loading: false, error: null });
      return { data, error: null };
    } catch (error: any) {
      const processedError = mapSupabaseError(error, 'reset-password');
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
        const processedError = mapSupabaseError(error, 'update-password');
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
      const processedError = mapSupabaseError(error, 'update-password');
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