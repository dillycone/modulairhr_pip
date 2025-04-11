import type { SupabaseClient, User } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';
import { getUserRole, userHasRole } from './get-user-role';

/**
 * Check if a user object has admin privileges
 * @param user Supabase user object 
 * @returns Boolean indicating if user has admin privileges
 */
export function isUserAdmin(user: User | null): boolean {
  // In development mode, always return true for testing
  if (process.env.NODE_ENV === 'development') {
    console.log("DEV MODE: Auto-granting admin permissions");
    return true;
  }
  
  return userHasRole(user, 'admin') || userHasRole(user, 'hr_admin');
}

/**
 * Check if the current user has admin permissions
 * @param supabase Supabase client instance
 * @returns Boolean indicating if user has admin privileges
 */
export async function isAdmin(
  supabase: SupabaseClient<Database>
): Promise<boolean> {
  // In development mode, always return true for testing
  if (process.env.NODE_ENV === 'development') {
    console.log("DEV MODE: Auto-granting admin permissions");
    return true;
  }
  
  const role = await getUserRole(supabase);
  
  // Allow both 'admin' and 'hr_admin' roles
  return role === 'admin' || role === 'hr_admin';
}