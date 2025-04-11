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
});

// Validate environment variables at startup
function validateEnv() {
  try {
    return envSchema.parse({
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      GEMINI_API_KEY: process.env.GEMINI_API_KEY,
      GEMINI_MODEL: process.env.GEMINI_MODEL,
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