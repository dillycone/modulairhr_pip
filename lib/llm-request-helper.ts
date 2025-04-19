import { NextRequest, NextResponse } from 'next/server';
import { env } from '@/lib/env';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { withRateLimit } from '@/lib/middleware/rate-limit';
import { RateLimiterOptions } from '@/lib/rate-limiter';
import { llmProvider } from './llm-providers';
import type { LLMRequestOptions } from './llm-providers/provider-interface';

// Re-export LLMRequestOptions for convenience
export type { LLMRequestOptions } from './llm-providers/provider-interface';

// Required roles for API endpoints
export const DEFAULT_REQUIRED_ROLES = ['admin', 'manager', 'hr_admin'] as const;

// Basic auth check result
export interface AuthResult {
  authenticated: boolean;
  user?: any;
  error?: string;
  status?: number;
}

// Process response function type
export type ProcessResponseFn<T> = (responseText: string) => T;

/**
 * Perform authentication and role verification
 */
export async function checkAuth(requiredRoles: readonly string[] = DEFAULT_REQUIRED_ROLES): Promise<AuthResult> {
  try {
    // Initialize Supabase client
    const supabase = await createServerSupabaseClient();

    // Check if user is authenticated
    const { data: { session }, error: authError } = await supabase.auth.getSession();

    if (authError || !session) {
      console.error('Authentication error:', authError);
      return {
        authenticated: false,
        error: 'Unauthorized - Please login to access this endpoint',
        status: 401
      };
    }

    // Development environment check - bypass role verification in dev
    if (process.env.NODE_ENV === 'development') {
      console.log('Dev environment: bypassing role checks for development');
      return {
        authenticated: true,
        user: session.user
      };
    }

    // Check user roles
    const userRoles = session.user.app_metadata?.roles as string[] | undefined || [];
    const canAccess = requiredRoles.some(requiredRole => userRoles.includes(requiredRole));
    
    if (!canAccess) {
      return {
        authenticated: false,
        error: 'Forbidden - Insufficient permissions',
        status: 403
      };
    }

    return {
      authenticated: true,
      user: session.user
    };
  } catch (error) {
    console.error('Error checking authentication:', error);
    return {
      authenticated: false,
      error: 'Internal server error during authentication',
      status: 500
    };
  }
}

/**
 * Create a rate-limited handler for LLM requests
 */
export function createRateLimitedHandler(
  handler: (req: NextRequest) => Promise<NextResponse>,
  options: RateLimiterOptions,
  getUserId: () => Promise<string>
) {
  return async (req: NextRequest) => {
    return withRateLimit(
      req,
      handler,
      options,
      async () => {
        try {
          const userId = await getUserId();
          return userId || 'anonymous';
        } catch (error) {
          console.error('Error getting user ID for rate limiting:', error);
          return 'anonymous';
        }
      }
    );
  };
}

/**
 * Make a simple text-to-text request to the LLM
 */
export async function makeTextRequest<T>(
  prompt: string,
  options: LLMRequestOptions = {},
  processResponse?: ProcessResponseFn<T>
): Promise<{ success: boolean; data?: T; error?: string }> {
  return llmProvider.makeTextRequest(prompt, options, processResponse as any);
}

/**
 * Make a multimodal request (with audio/image/etc.) to the LLM
 */
export async function makeMultimodalRequest<T>(
  parts: any[],
  options: LLMRequestOptions = {},
  processResponse?: ProcessResponseFn<T>
): Promise<{ success: boolean; data?: T; error?: string }> {
  return llmProvider.makeMultimodalRequest(parts, options, processResponse as any);
}