import type { SupabaseClient, User } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';
import { shouldBypassAuth } from '@/lib/env';
import { UserRole } from '@/types/roles';
import { userHasRole } from './permissions';

/**
 * Check if a user is an admin
 * @param user Supabase user object 
 * @returns Boolean indicating if user is an admin
 */
export function isUserAdmin(user: User | null): boolean {
  // In development mode, can bypass auth checks
  if (shouldBypassAuth()) {
    console.log("DEV MODE: Auto-granting admin permissions");
    return true;
  }
  
  return userHasRole(user, UserRole.ADMIN);
}

/**
 * Check if the current user is an admin
 * @param supabase Supabase client instance
 * @returns Boolean indicating if user is an admin
 */
export async function isAdmin(
  supabase: SupabaseClient<Database>
): Promise<boolean> {
  // In development mode, can bypass auth checks
  if (shouldBypassAuth()) {
    console.log("DEV MODE: Auto-granting admin permissions");
    return true;
  }
  
  // Get the current user
  const { data: { user } } = await supabase.auth.getUser();
  
  return isUserAdmin(user);
}