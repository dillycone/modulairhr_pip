/**
 * A utility to unify error handling with consistent messaging or shapes.
 */
export function translateError(error: any): string {
  if (!error) {
    return 'An unexpected error occurred.';
  }
  // If it's a string, return directly
  if (typeof error === 'string') {
    return error;
  }
  // If it's an Error-like object
  if (error.message) {
    return error.message;
  }
  // If the error has a code, we could also handle specific error codes
  if (error.code) {
    return `Error [${error.code}]: Something went wrong.`;
  }
  // Fallback
  return 'An unknown error has occurred.';
}

/**
 * Centralized auth error handling utilities
 */

// Auth error types
export type AuthErrorCode = 
  | 'no_code'
  | 'exchange_error'
  | 'session_error'
  | 'callback_error'
  | 'login_failed'
  | 'signup_failed'
  | 'reset_failed'
  | 'update_failed'
  | 'verification_failed'
  | 'rate_limited'
  | 'invalid_request';

export interface AuthError {
  code: AuthErrorCode | string;
  message: string;
}

// Map common auth errors to user-friendly messages
export const mapAuthError = (errorCode: string, errorMessage: string): AuthError => {
  const defaultMessage = 'Authentication failed. Please try again.';
  
  const errorMap: Record<string, string> = {
    // Authorization code flow errors
    'no_code': 'Invalid authentication request. Please try logging in again.',
    'exchange_error': (errorMessage.includes('expired') || errorMessage.includes('timeout')) 
      ? 'Your authentication link has expired. Please request a new one.' 
      : 'Failed to complete authentication. Please try again.',
    'session_error': 'Unable to establish a secure session. Please try again.',
    
    // Login errors
    'login_failed': 'Invalid email or password. Please try again.',
    'rate_limited': 'Too many failed attempts. Please try again later.',
    
    // Signup errors
    'signup_failed': 'Failed to create account. This email may already be registered.',
    
    // Password reset errors
    'reset_failed': 'Failed to reset password. Please try again.',
    'update_failed': 'Failed to update password. Please try again.',
    
    // Email verification
    'verification_failed': 'Email verification failed. The link may have expired.',
  };

  return {
    code: errorCode,
    message: errorMap[errorCode] || errorMessage || defaultMessage
  };
};

// Format error for URL parameters
export const formatErrorForUrl = (error: AuthError): string => {
  return `error=${encodeURIComponent(error.code)}&message=${encodeURIComponent(error.message)}`;
};

// Create rate limit error
export const createRateLimitError = (timeLeft: number): AuthError => {
  return {
    code: 'rate_limited',
    message: `Too many failed login attempts. Please try again in ${timeLeft} seconds.`
  };
}; 