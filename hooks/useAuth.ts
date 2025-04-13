"use client";

import { useContext, createContext } from 'react';
import type { User, Session } from '@supabase/supabase-js';

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

export interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: AuthError | null;
}

export interface AuthResponse {
  data: any;
  error: AuthError | null;
}

// Create Auth Context
export interface AuthContextType extends AuthState {
  signIn: (opts: { email: string; password: string; rememberMe?: boolean }) => Promise<AuthResponse>;
  signUp: (email: string, password: string) => Promise<AuthResponse>;
  signOut: () => Promise<{ error: AuthError | null }>;
  resetPassword: (email: string) => Promise<AuthResponse>;
  updatePassword: (newPassword: string) => Promise<AuthResponse>;
  onAuthStateReady: (callback: () => void) => () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create hook for accessing the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};