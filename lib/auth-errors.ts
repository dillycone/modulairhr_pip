/**
 * This file is no longer used. 
 * The error processing logic has been moved directly into the useAuth hook
 * to avoid circular dependency issues.
 */

/**
 * Standardized authentication error handling utilities
 */

// Known error codes and their user-friendly messages
export const AUTH_ERROR_MESSAGES: Record<string, string> = {
  // Supabase-specific error codes
  'auth/invalid-email': 'The email address is not valid.',
  'auth/user-disabled': 'This account has been disabled.',
  'auth/user-not-found': 'No account found with this email address.',
  'auth/wrong-password': 'Incorrect password. Please try again.',
  'auth/email-already-in-use': 'An account with this email already exists.',
  'auth/weak-password': 'Password is too weak. Use at least 6 characters.',
  'auth/popup-closed-by-user': 'Sign-in was cancelled.',
  'auth/cancelled-popup-request': 'The sign-in process was cancelled.',
  'auth/popup-blocked': 'Sign-in popup was blocked by your browser.',
  'auth/network-request-failed': 'A network error occurred. Please check your connection.',
  'auth/too-many-requests': 'Too many unsuccessful attempts. Please try again later.',
  'auth/expired-action-code': 'This reset link has expired. Please request a new one.',
  'auth/invalid-action-code': 'This reset link is invalid. It may have been used already.',
  'auth/missing-oauth-credentials': 'Authentication service configuration error. Please contact support.',

  // Generic errors
  'server-error': 'A server error occurred. Please try again later.',
  'unknown-error': 'An unknown error occurred. Please try again.',
  'network-error': 'A network error occurred. Please check your connection.',
};

// Maps Supabase error messages to standardized error codes
export const getErrorCode = (errorMessage: string): string => {
  const lowerCaseError = errorMessage.toLowerCase();
  
  if (lowerCaseError.includes('invalid login')) return 'auth/wrong-password';
  if (lowerCaseError.includes('user not found')) return 'auth/user-not-found';
  if (lowerCaseError.includes('email already')) return 'auth/email-already-in-use';
  if (lowerCaseError.includes('network')) return 'network-error';
  if (lowerCaseError.includes('server')) return 'server-error';
  if (lowerCaseError.includes('too many requests')) return 'auth/too-many-requests';
  if (lowerCaseError.includes('expired')) return 'auth/expired-action-code';
  if (lowerCaseError.includes('password') && lowerCaseError.includes('weak')) return 'auth/weak-password';
  
  return 'unknown-error';
};

/**
 * Gets a user-friendly error message based on the raw error from the auth provider
 */
export const getUserFriendlyErrorMessage = (error: any): string => {
  if (!error) return AUTH_ERROR_MESSAGES['unknown-error'];
  
  // Handle error string
  if (typeof error === 'string') {
    const errorCode = getErrorCode(error);
    return AUTH_ERROR_MESSAGES[errorCode] || error;
  }
  
  // Handle error object
  if (error.message) {
    const errorCode = getErrorCode(error.message);
    return AUTH_ERROR_MESSAGES[errorCode] || error.message;
  }
  
  return AUTH_ERROR_MESSAGES['unknown-error'];
};

/**
 * Processes an error from the authentication provider and returns a standardized object
 */
export const processAuthError = (error: any) => {
  const errorMessage = getUserFriendlyErrorMessage(error);
  const errorCode = typeof error === 'string' 
    ? getErrorCode(error) 
    : error.code || getErrorCode(error.message || '');
  
  return {
    message: errorMessage,
    code: errorCode,
    original: error
  };
}; 