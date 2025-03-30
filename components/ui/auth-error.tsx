import React from 'react';
import { 
  AlertCircle,
  AlertTriangle,
  Info,
  XCircle
} from 'lucide-react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

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
  message: string;
  details?: string;
}

/**
 * An error message component specifically designed for authentication scenarios
 */
export function AuthError({
  className,
  severity,
  message,
  details,
  ...props
}: AuthErrorProps) {
  // Select icon based on severity
  const Icon = severity === 'info' 
    ? Info 
    : severity === 'warning' 
      ? AlertTriangle 
      : severity === 'success' 
        ? Info
        : XCircle;
  
  return (
    <div className={cn(authErrorVariants({ severity }), className)} {...props}>
      <Icon className="h-5 w-5 flex-shrink-0" />
      <div>
        <p className="font-medium">{message}</p>
        {details && <p className="mt-1">{details}</p>}
      </div>
    </div>
  );
} 