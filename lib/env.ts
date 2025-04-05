/**
 * Environment variables with validation
 */

// Validate that required environment variables are present
function validateEnv() {
  const requiredEnvVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'GEMINI_API_KEY'
  ];

  const missingVars = requiredEnvVars.filter(
    varName => typeof process.env[varName] === 'undefined'
  );

  if (missingVars.length > 0) {
    console.warn(`⚠️ Missing environment variable(s): ${missingVars.join(', ')}`);
    console.warn('Please check your .env.local file and restart the server.');
  }
}

// Run validation in development
if (process.env.NODE_ENV === 'development') {
  validateEnv();
}

// Export typed environment variables
export const env = {
  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  
  // Gemini
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
  GEMINI_MODEL: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
  
  // Helper to check if all required variables are set
  isComplete: () => {
    return !!(
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
      process.env.GEMINI_API_KEY
    );
  }
}; 