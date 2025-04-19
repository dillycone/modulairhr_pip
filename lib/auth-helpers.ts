"use client";

import { AuthError } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

/**
 * Enum for authentication error codes
 */
export enum AuthErrorCode {
  // Session errors
  SESSION_ERROR = 'session-error',
  
  // Sign-in errors
  INVALID_CREDENTIALS = 'invalid-credentials',
  EMAIL_NOT_CONFIRMED = 'email-not-confirmed',
  RATE_LIMITED = 'rate-limited',
  
  // Sign-up errors
  EMAIL_IN_USE = 'email-in-use',
  INVALID_EMAIL = 'invalid-email',
  WEAK_PASSWORD = 'weak-password',
  
  // Password errors
  PASSWORD_RESET_FAILED = 'password-reset-failed',
  PASSWORD_UPDATE_FAILED = 'password-update-failed',
  
  // Generic errors
  NETWORK_ERROR = 'network-error',
  UNKNOWN_ERROR = 'unknown-error'
}

/**
 * Interface for application-specific auth error
 */
export interface AppAuthError {
  code: AuthErrorCode;
  message: string;
  originalError?: Error | AuthError | any;
}

/**
 * Maps Supabase auth errors to user-friendly errors
 */
export function mapAuthError(error: Error | AuthError | any, context: string = 'general'): AppAuthError {
  if (!error) {
    return {
      code: AuthErrorCode.UNKNOWN_ERROR,
      message: 'An unknown error occurred'
    };
  }
  
  // Network errors
  if (error.message && typeof error.message === 'string') {
    if (error.message.includes('network') || error.message.toLowerCase().includes('fetch')) {
      return {
        code: AuthErrorCode.NETWORK_ERROR,
        message: 'Please check your internet connection and try again',
        originalError: error
      };
    }
  }
  
  // Handle Supabase-specific errors by context
  switch (context) {
    case 'signin':
      if (error.message?.includes('Invalid login credentials') || error.message?.includes('invalid credentials')) {
        return {
          code: AuthErrorCode.INVALID_CREDENTIALS,
          message: 'The email or password you entered is incorrect',
          originalError: error
        };
      } 
      if (error.message?.includes('Email not confirmed')) {
        return {
          code: AuthErrorCode.EMAIL_NOT_CONFIRMED,
          message: 'Please check your email and confirm your account before signing in',
          originalError: error
        };
      }
      if (error.message?.includes('rate limit') || error.message?.includes('too many requests')) {
        return {
          code: AuthErrorCode.RATE_LIMITED,
          message: 'Too many sign-in attempts. Please try again later',
          originalError: error
        };
      }
      break;
      
    case 'signup':
      if (error.message?.includes('already in use') || error.message?.includes('already registered')) {
        return {
          code: AuthErrorCode.EMAIL_IN_USE,
          message: 'This email is already registered',
          originalError: error
        };
      }
      if (error.message?.includes('valid email')) {
        return {
          code: AuthErrorCode.INVALID_EMAIL,
          message: 'Please enter a valid email address',
          originalError: error
        };
      }
      if (error.message?.includes('password') && error.message?.includes('strong')) {
        return {
          code: AuthErrorCode.WEAK_PASSWORD,
          message: 'Please use a stronger password',
          originalError: error
        };
      }
      break;
      
    case 'reset-password':
      return {
        code: AuthErrorCode.PASSWORD_RESET_FAILED,
        message: 'Failed to send password reset email. Please try again',
        originalError: error
      };
      
    case 'update-password':
      return {
        code: AuthErrorCode.PASSWORD_UPDATE_FAILED,
        message: 'Failed to update password. Please try again',
        originalError: error
      };
      
    case 'session':
      return {
        code: AuthErrorCode.SESSION_ERROR,
        message: 'Session error. Please try signing in again',
        originalError: error
      };
  }
  
  // Default error with original message
  return {
    code: AuthErrorCode.UNKNOWN_ERROR,
    message: error.message || 'An unexpected error occurred',
    originalError: error
  };
}

/**
 * Creates a rate limit error
 */
export function createRateLimitError(timeLeft?: number): AppAuthError {
  const message = timeLeft 
    ? `Too many attempts. Please try again in ${timeLeft} seconds`
    : 'Too many attempts. Please try again later';
    
  return {
    code: AuthErrorCode.RATE_LIMITED,
    message
  };
}

/**
 * Verify and refresh a session if needed with rate limiting
 * @returns An object containing user data and any errors
 */
export async function verifySession() {
  // Constants for rate limiting
  const SESSION_REFRESH_KEY = 'last_session_refresh';
  const REFRESH_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes
  const REFRESH_JITTER_MS = 30 * 1000; // Add 0-30s random jitter to avoid thundering herd
  
  // Helper to check if we can refresh based on time elapsed
  const canRefreshSession = () => {
    try {
      const lastRefresh = localStorage.getItem(SESSION_REFRESH_KEY);
      if (!lastRefresh) return true;
      
      const lastRefreshTime = parseInt(lastRefresh, 10);
      const now = Date.now();
      // Add random jitter to the interval
      const jitter = Math.floor(Math.random() * REFRESH_JITTER_MS);
      return (now - lastRefreshTime) > (REFRESH_INTERVAL_MS + jitter);
    } catch (e) {
      // If localStorage fails, default to allowing refresh
      return true;
    }
  };
  
  // Update the last refresh timestamp
  const updateLastRefreshTime = () => {
    try {
      localStorage.setItem(SESSION_REFRESH_KEY, Date.now().toString());
    } catch (e) {
      console.warn('Failed to update session refresh timestamp', e);
    }
  };
  
  try {
    // First check if we have a valid session
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('Session error:', sessionError);
      return { user: null, error: mapAuthError(sessionError, 'session') };
    }
    
    // If no session, try to refresh, but respect rate limiting
    if (!sessionData.session) {
      // Check rate limiting before refresh
      if (!canRefreshSession()) {
        console.log('Rate limit applied: skipping session refresh to prevent API limit errors');
        return { 
          user: null, 
          error: mapAuthError(new Error('Session refresh throttled to prevent rate limiting'), 'session')
        };
      }
      
      console.log('No session found, attempting to refresh...');
      updateLastRefreshTime(); // Mark the refresh attempt
      
      const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
      
      if (refreshError || !refreshData.session) {
        console.error('Session refresh failed:', refreshError);
        return { 
          user: null, 
          error: mapAuthError(refreshError || new Error('Session refresh failed'), 'session')
        };
      }
      
      console.log('Session refreshed successfully');
      return { user: refreshData.user, error: null };
    }
    
    // Valid session exists
    return { user: sessionData.session.user, error: null };
  } catch (error) {
    console.error('Unexpected error during session verification:', error);
    return { user: null, error: mapAuthError(error, 'session') };
  }
}

/**
 * Force a session refresh from cookies and return the user
 * Includes rate limiting to prevent "Request rate limit reached" errors
 */
export async function refreshSessionFromCookies() {
  // Constants for rate limiting
  const SESSION_REFRESH_KEY = 'last_cookies_refresh';
  const REFRESH_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes
  const BACKOFF_INCREMENT_MS = 60 * 1000; // Add 1 minute for each consecutive error
  const MAX_BACKOFF_MS = 30 * 60 * 1000; // Max 30 minutes
  
  try {
    // Check if we've recently refreshed to prevent rate limiting
    const lastRefresh = localStorage.getItem(SESSION_REFRESH_KEY);
    const errorCount = parseInt(localStorage.getItem('session_refresh_errors') || '0', 10);
    
    if (lastRefresh) {
      const lastRefreshTime = parseInt(lastRefresh, 10);
      const now = Date.now();
      
      // Calculate backoff time based on previous errors
      const backoffTime = Math.min(
        REFRESH_INTERVAL_MS + (errorCount * BACKOFF_INCREMENT_MS), 
        MAX_BACKOFF_MS
      );
      
      if ((now - lastRefreshTime) < backoffTime) {
        console.log(`Skipping session refresh - rate limiting (${Math.round((backoffTime - (now - lastRefreshTime))/1000)}s remaining)`);
        return { 
          user: null, 
          error: mapAuthError(
            new Error('Session refresh rate limited to prevent API errors'), 
            'session'
          )
        };
      }
    }
    
    // Update timestamp before attempting refresh
    localStorage.setItem(SESSION_REFRESH_KEY, Date.now().toString());
    
    // Force a refresh to pull the latest cookie data
    const { data, error } = await supabase.auth.refreshSession();
    
    if (error) {
      console.error('Error refreshing session:', error);
      
      // Track consecutive errors for exponential backoff
      localStorage.setItem('session_refresh_errors', (errorCount + 1).toString());
      
      return { user: null, error: mapAuthError(error, 'session') };
    }
    
    // Reset error count on success
    localStorage.setItem('session_refresh_errors', '0');
    
    return { user: data.user, error: null };
  } catch (error) {
    console.error('Unexpected error refreshing session:', error);
    return { user: null, error: mapAuthError(error, 'session') };
  }
}

/**
 * Wrapper to handle sign out with proper cleanup
 */
export async function signOutAndCleanup() {
  try {
    // Sign out from Supabase
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('Error signing out:', error);
      return { error: mapAuthError(error, 'general') };
    }
    
    // Clear any local storage items related to auth
    if (typeof window !== 'undefined') {
      localStorage.removeItem('loginAttempts');
      localStorage.removeItem('cooldownEnd');
      localStorage.removeItem('lastAttemptTime');
    }
    
    return { error: null };
  } catch (error) {
    console.error('Unexpected error during sign out:', error);
    return { error: mapAuthError(error, 'general') };
  }
} 