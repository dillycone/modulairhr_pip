"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { 
  AppAuthError, 
  AuthErrorCode,
  mapAuthError,
  signOutAndCleanup 
} from '@/lib/auth-helpers';
import { getSessionWithRefresh } from '@/lib/session-manager';

/**
 * Auth context state interface
 */
export interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: AppAuthError | null;
}

/**
 * Auth response type
 */
export interface AuthResponse {
  data: any;
  error: AppAuthError | null;
}

/**
 * Auth context interface with state and methods
 */
export interface AuthContextProps extends AuthState {
  // Auth actions
  signIn: (opts: { email: string; password: string; rememberMe?: boolean }) => Promise<AuthResponse>;
  signUp: (email: string, password: string) => Promise<AuthResponse>;
  signOut: () => Promise<{ error: AppAuthError | null }>;
  resetPassword: (email: string) => Promise<AuthResponse>;
  updatePassword: (newPassword: string) => Promise<AuthResponse>;
  
  // Helper for handling auth state
  isInitialized: boolean;
  
  // Reset errors
  clearError: () => void;
}

/**
 * Create auth context with default undefined value
 */
const AuthContext = createContext<AuthContextProps | undefined>(undefined);

/**
 * Auth Provider component for wrapping app with auth context
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  // Auth state
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    error: null,
  });

  // Track whether auth has been initialized
  const [isInitialized, setIsInitialized] = useState(false);

  // Update auth state in a consistent way
  const updateAuthState = (updates: Partial<AuthState>) => {
    setState(prev => ({
      ...prev,
      ...updates,
    }));
  };

  // Clear error state
  const clearError = () => {
    updateAuthState({ error: null });
  };

  // Initialize auth state on component mount
  useEffect(() => {
    // Track component mount status to prevent setState on unmounted component
    let mounted = true;
    let authStateSubscription: { data?: { subscription: { unsubscribe: () => void } } } = {};
    
    const initializeAuth = async () => {
      try {
        console.log('Initializing auth using centralized session manager...');
        
        // Use the centralized session manager to get and potentially refresh the session
        const { data, error: sessionError } = await getSessionWithRefresh();
        
        if (sessionError) {
          console.error('Error getting session:', sessionError);
          
          if (mounted) {
            updateAuthState({ 
              loading: false, 
              error: mapAuthError(sessionError, 'session')
            });
            setIsInitialized(true);
          }
          return;
        }
        
        const session = data?.session;

        if (mounted) {
          updateAuthState({ 
            session, 
            user: session?.user || null, 
            loading: false, 
            error: null 
          });
          setIsInitialized(true);
        }

        // Subscribe to auth changes
        authStateSubscription = supabase.auth.onAuthStateChange(async (event, newSession) => {
          console.log('Auth state changed:', event);

          if (mounted) {
            updateAuthState({
              session: newSession,
              user: newSession?.user ?? null,
              loading: false,
              error: null
            });
          }
        });
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (mounted) {
          updateAuthState({ 
            loading: false, 
            error: mapAuthError(error, 'session')
          });
          setIsInitialized(true);
        }
      }
    };

    // Start initialization
    initializeAuth();

    // Cleanup on unmount
    return () => {
      mounted = false;
      try {
        authStateSubscription.data?.subscription?.unsubscribe();
      } catch (error) {
        console.error('Error unsubscribing from auth listener:', error);
      }
    };
  }, []);

  /**
   * Sign in with email and password
   */
  const signIn = async (opts: { email: string; password: string; rememberMe?: boolean }): Promise<AuthResponse> => {
    try {
      updateAuthState({ loading: true, error: null });

      const { data, error } = await supabase.auth.signInWithPassword({
        email: opts.email,
        password: opts.password,
      });

      if (error) {
        const processedError = mapAuthError(error, 'signin');
        updateAuthState({ loading: false, error: processedError });
        return { data: null, error: processedError };
      }

      updateAuthState({
        user: data?.user || null,
        session: data?.session || null,
        loading: false,
        error: null
      });

      return { data, error: null };
    } catch (error) {
      const processedError = mapAuthError(error, 'signin');
      updateAuthState({ loading: false, error: processedError });
      return { data: null, error: processedError };
    }
  };

  /**
   * Sign up with email and password
   */
  const signUp = async (email: string, password: string): Promise<AuthResponse> => {
    try {
      updateAuthState({ loading: true, error: null });

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin + '/auth/callback',
        },
      });

      if (error) {
        const processedError = mapAuthError(error, 'signup');
        updateAuthState({ loading: false, error: processedError });
        return { data: null, error: processedError };
      }

      updateAuthState({
        user: data.user,
        session: data.session,
        loading: false,
        error: null
      });

      return { data, error: null };
    } catch (error) {
      const processedError = mapAuthError(error, 'signup');
      updateAuthState({ loading: false, error: processedError });
      return { data: null, error: processedError };
    }
  };

  /**
   * Sign out
   */
  const signOut = async (): Promise<{ error: AppAuthError | null }> => {
    try {
      updateAuthState({ loading: true, error: null });

      const { error } = await signOutAndCleanup();

      if (error) {
        updateAuthState({ loading: false, error });
        return { error };
      }

      updateAuthState({
        user: null,
        session: null,
        loading: false,
        error: null
      });

      return { error: null };
    } catch (error) {
      const processedError = mapAuthError(error);
      updateAuthState({ loading: false, error: processedError });
      return { error: processedError };
    }
  };

  /**
   * Reset password
   */
  const resetPassword = async (email: string): Promise<AuthResponse> => {
    try {
      updateAuthState({ loading: true, error: null });

      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/auth/update-password',
      });

      if (error) {
        const processedError = mapAuthError(error, 'reset-password');
        updateAuthState({ loading: false, error: processedError });
        return { data: null, error: processedError };
      }

      updateAuthState({ loading: false, error: null });
      return { data, error: null };
    } catch (error) {
      const processedError = mapAuthError(error, 'reset-password');
      updateAuthState({ loading: false, error: processedError });
      return { data: null, error: processedError };
    }
  };

  /**
   * Update password
   */
  const updatePassword = async (newPassword: string): Promise<AuthResponse> => {
    try {
      updateAuthState({ loading: true, error: null });

      const { data, error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        const processedError = mapAuthError(error, 'update-password');
        updateAuthState({ loading: false, error: processedError });
        return { data: null, error: processedError };
      }

      // Refresh session after password update
      const { data: sessionData } = await supabase.auth.getSession();

      updateAuthState({
        user: sessionData?.session?.user || data?.user || null,
        session: sessionData?.session || null,
        loading: false,
        error: null
      });

      return { data, error: null };
    } catch (error) {
      const processedError = mapAuthError(error, 'update-password');
      updateAuthState({ loading: false, error: processedError });
      return { data: null, error: processedError };
    }
  };

  // Auth context value to expose
  const contextValue: AuthContextProps = {
    ...state,
    isInitialized,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    clearError,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Custom hook to use auth context
 */
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}

// Re-export AuthErrorCode from auth-helpers
export { AuthErrorCode };