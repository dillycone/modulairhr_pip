import React from 'react';
import { 
  AlertCircle,
  AlertTriangle,
  Info,
  XCircle
} from 'lucide-react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { AuthError as AuthErrorType, AuthErrorCode } from '@/hooks/useAuth';

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