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

// If you want to handle supabase errors specifically, you could do so:
// export function translateSupabaseError(error: PostgrestError | AuthError | etc.) { ... } 