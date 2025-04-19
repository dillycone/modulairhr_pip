import { z } from 'zod';

// Define schema for environment variables
const envSchema = z.object({
  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: z.string().min(1),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  
  // Email
  RESEND_API_KEY: z.string().optional(),
  NOTIFICATION_EMAIL: z.string().email().optional(),
  
  // AI Providers
  GEMINI_API_KEY: z.string().optional(),
  GEMINI_MODEL: z.string().optional().default("gemini-2.5-pro-preview-03-25"),
  ANTHROPIC_API_KEY: z.string().optional(),
  ANTHROPIC_MODEL: z.string().optional().default("claude-3-5-sonnet-20240620"),
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_MODEL: z.string().optional().default("gpt-4o"),
  AWS_REGION: z.string().optional(),
  AWS_ACCESS_KEY: z.string().optional(),
  AWS_SECRET_KEY: z.string().optional(),
  AWS_BEDROCK_MODEL: z.string().optional().default("anthropic.claude-3-5-sonnet-20240620"),
  
  // Selected provider
  LLM_PROVIDER: z.enum(['google', 'anthropic', 'openai', 'bedrock']).default('google'),
  
  // Feature flags
  MOCK_DATA_ENABLED: z.boolean().default(false),
  
  // Redis
  UPSTASH_REDIS_REST_URL: z.string().min(1).optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(1).optional(),
  
  // Development mode controls - optional
  NEXT_PUBLIC_DEV_BYPASS_AUTH: z.enum(['true', 'false']).optional().default('false'),
  NEXT_PUBLIC_DISABLE_DEBUG: z.enum(['true', 'false']).optional().default('false'),
});

// Determine if we're running on the client or server
const isClient = typeof window !== 'undefined';

// Define client-side only schema
const clientEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().min(1),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  NEXT_PUBLIC_DEV_BYPASS_AUTH: z.enum(['true', 'false']).optional().default('false'),
  NEXT_PUBLIC_DISABLE_DEBUG: z.enum(['true', 'false']).optional().default('false'),
});

// Define server-side schema
const serverEnvSchema = envSchema;

// Parse environment variables
// Validate environment variables appropriately for client/server
function validateEnv() {
  try {
    // For client-side, only validate public env vars with relaxed requirements
    if (isClient) {
      return clientEnvSchema.parse({
        NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
        NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        NEXT_PUBLIC_DEV_BYPASS_AUTH: process.env.NEXT_PUBLIC_DEV_BYPASS_AUTH,
        NEXT_PUBLIC_DISABLE_DEBUG: process.env.NEXT_PUBLIC_DISABLE_DEBUG,
      });
    }
    
    // For server-side, validate all env vars
    return serverEnvSchema.parse({
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      GEMINI_API_KEY: process.env.GEMINI_API_KEY,
      GEMINI_MODEL: process.env.GEMINI_MODEL,
      ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
      ANTHROPIC_MODEL: process.env.ANTHROPIC_MODEL,
      OPENAI_API_KEY: process.env.OPENAI_API_KEY,
      OPENAI_MODEL: process.env.OPENAI_MODEL,
      AWS_REGION: process.env.AWS_REGION,
      AWS_ACCESS_KEY: process.env.AWS_ACCESS_KEY,
      AWS_SECRET_KEY: process.env.AWS_SECRET_KEY,
      AWS_BEDROCK_MODEL: process.env.AWS_BEDROCK_MODEL,
      LLM_PROVIDER: process.env.LLM_PROVIDER,
      MOCK_DATA_ENABLED: process.env.MOCK_DATA_ENABLED === 'true',
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
      // On the client, don't throw for missing vars, just log them
      if (isClient) {
        console.error('Missing environment variables on client side. This is expected for server-only vars.');
        return clientEnvSchema.parse({
          NEXT_PUBLIC_DEV_BYPASS_AUTH: 'false',
          NEXT_PUBLIC_DISABLE_DEBUG: 'false',
        });
      }
      throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
    }
    // On client, provide safe defaults
    if (isClient) {
      console.error('Error validating environment variables:', error);
      return clientEnvSchema.parse({
        NEXT_PUBLIC_DEV_BYPASS_AUTH: 'false',
        NEXT_PUBLIC_DISABLE_DEBUG: 'false',
      });
    }
    throw error;
  }
}

// Validate and export typed environment variables
export const env = validateEnv();

// Helper function to check if mock data should be used with clear logging
export function useMockData(): boolean {
  try {
    const enabled = process.env.NODE_ENV === 'development' && 
                    process.env.MOCK_DATA_ENABLED === 'true';
    if (enabled) {
      console.warn('⚠️ MOCK DATA MODE ENABLED - Using fake data instead of real database ⚠️');
    }
    return !!enabled;
  } catch (error) {
    // Default to false if any error occurs
    return false;
  }
}

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
  
  try {
    // Check if bypasses are explicitly disabled via environment variable
    return env.NEXT_PUBLIC_DEV_BYPASS_AUTH === 'true';
  } catch (error) {
    // Safer default - if there's any issue, don't bypass auth
    return false;
  }
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
  
  try {
    // In development, can be explicitly disabled with environment variable
    const debugDisabled = env.NEXT_PUBLIC_DISABLE_DEBUG === 'true';
    return !debugDisabled;
  } catch (error) {
    // If there's any error accessing env, default to disabled
    return false;
  }
}