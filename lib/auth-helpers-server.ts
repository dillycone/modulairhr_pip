// Server-side auth helpers (no "use client" directive)

import { AuthError } from '@supabase/supabase-js';

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