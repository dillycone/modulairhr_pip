import { z } from 'zod';

/**
 * Environment variables schema and validation
 */

const envSchema = z.object({
  // Supabase - required public variables
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  
  // Gemini - required server-side only
  GEMINI_API_KEY: z.string().min(1),
  GEMINI_MODEL: z.string().default('gemini-1.5-flash'),

  // Upstash Redis - required server-side only
  UPSTASH_REDIS_REST_URL: z.string().url(),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(1),
  
  // Development mode controls - optional
  NEXT_PUBLIC_DEV_BYPASS_AUTH: z.enum(['true', 'false']).optional().default('false'),
  NEXT_PUBLIC_DISABLE_DEBUG: z.enum(['true', 'false']).optional().default('false'),

  // Email notifications - required for waitlist
  RESEND_API_KEY: z.string().min(1),
  NOTIFICATION_EMAIL: z.string().email(),
});

// Validate environment variables at startup
function validateEnv() {
  try {
    return envSchema.parse({
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      GEMINI_API_KEY: process.env.GEMINI_API_KEY,
      GEMINI_MODEL: process.env.GEMINI_MODEL,
      UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
      UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
      NEXT_PUBLIC_DEV_BYPASS_AUTH: process.env.NEXT_PUBLIC_DEV_BYPASS_AUTH,
      NEXT_PUBLIC_DISABLE_DEBUG: process.env.NEXT_PUBLIC_DISABLE_DEBUG,
      RESEND_API_KEY: process.env.RESEND_API_KEY,
      NOTIFICATION_EMAIL: process.env.NOTIFICATION_EMAIL,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors.map(err => err.path.join('.'));
      console.error('❌ Invalid/missing environment variables:');
      console.error(error.errors.map(err => `- ${err.path.join('.')}: ${err.message}`).join('\n'));
      throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
    }
    throw error;
  }
}

// Validate and export typed environment variables
export const env = validateEnv();

/**
 * Centralized control for development bypasses
 * Ensure all dev mode bypasses use this function rather than checking NODE_ENV directly
 * This makes it easier to test production-like behavior in development
 */
export function shouldBypassAuth(): boolean {
  // Only allow bypasses in development mode, never in production
  if (process.env.NODE_ENV !== 'development') {
    return false;
  }
  
  // Check if bypasses are explicitly disabled via environment variable
  return env.NEXT_PUBLIC_DEV_BYPASS_AUTH !== 'false';
}

/**
 * Determines if debug features should be accessible
 * Debug features are only available in development mode and can be explicitly enabled/disabled
 */
export function isDebugEnabled(): boolean {
  // Never enable in production
  if (process.env.NODE_ENV === 'production') {
    return false;
  }
  
  // In development, can be explicitly disabled with environment variable
  const debugDisabled = process.env.NEXT_PUBLIC_DISABLE_DEBUG === 'true';
  return !debugDisabled;
}