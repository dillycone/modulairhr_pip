import React from 'react';
import { 
  AlertCircle,
  AlertTriangle,
  Info,
  XCircle
} from 'lucide-react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
// Import the enum directly to avoid dependency issues
enum AuthErrorCode {
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

// Define a simplified auth error type to avoid dependency issues
interface AuthErrorType {
  message: string;
  code?: AuthErrorCode;
  original?: unknown;
}

/**
 * Variants for the AuthError component
 */
const authErrorVariants = cva(
  "flex items-start gap-2 rounded-md p-3 text-sm",
  {
    variants: {
      severity: {
        info: "bg-blue-50 text-blue-800",
        warning: "bg-yellow-50 text-yellow-800",
        error: "bg-red-50 text-red-800",
        success: "bg-green-50 text-green-800",
      },
    },
    defaultVariants: {
      severity: "error",
    },
  }
);

export interface AuthErrorProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof authErrorVariants> {
  error?: AuthErrorType | null;
  message?: string;
  details?: string;
}

// Helper to determine severity based on error code
const getSeverityFromErrorCode = (code?: AuthErrorCode): 'info' | 'warning' | 'error' => {
  if (!code) return 'error';
  
  // Information errors (less severe)
  if (code === AuthErrorCode.SESSION_EXPIRED) {
    return 'info';
  }
  
  // Warning errors
  if (
    code === AuthErrorCode.SIGNIN_EMAIL_NOT_CONFIRMED ||
    code === AuthErrorCode.SIGNUP_WEAK_PASSWORD
  ) {
    return 'warning';
  }
  
  // All others are treated as errors
  return 'error';
};

/**
 * An error message component specifically designed for authentication scenarios
 * Can accept either a raw message or a structured AuthError object
 */
export function AuthError({
  className,
  severity,
  error,
  message,
  details,
  ...props
}: AuthErrorProps) {
  // If an error object is provided, use its data
  const errorMessage = error?.message || message || '';
  const errorDetails = details || '';
  
  // Determine severity if not explicitly provided
  const effectiveSeverity = severity || (error ? getSeverityFromErrorCode(error.code) : 'error');
  
  // Select icon based on severity
  const Icon = effectiveSeverity === 'info' 
    ? Info 
    : effectiveSeverity === 'warning' 
      ? AlertTriangle 
      : effectiveSeverity === 'success' 
        ? Info
        : XCircle;
  
  if (!errorMessage) return null;
  
  return (
    <div className={cn(authErrorVariants({ severity: effectiveSeverity }), className)} {...props}>
      <Icon className="h-5 w-5 flex-shrink-0" />
      <div>
        <p className="font-medium">{errorMessage}</p>
        {errorDetails && <p className="mt-1">{errorDetails}</p>}
      </div>
    </div>
  );
} 