import type { SupabaseClient, User } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

/**
 * Returns the highest priority role from a roles array
 * @param roles Array of user roles
 * @returns The highest priority role or default 'user' role
 */
export function getPrimaryRole(roles: string[] | undefined): string {
  if (!roles || roles.length === 0) return 'user';
  
  // Order of precedence: admin > hr_admin > manager > employee > user
  if (roles.includes('admin')) return 'admin';
  if (roles.includes('hr_admin')) return 'hr_admin';
  if (roles.includes('manager')) return 'manager';
  if (roles.includes('employee')) return 'employee';
  
  // Return the first role if none of the above match
  return roles[0];
}

/**
 * Checks if a user has a specific role
 * @param user Supabase user object
 * @param role Role to check for
 * @returns Boolean indicating if user has the role
 */
export function userHasRole(user: User | null, role: string): boolean {
  if (!user) return false;
  
  const roles = user.app_metadata?.roles as string[] | undefined;
  return !!roles && roles.includes(role);
}

/**
 * Fetches the roles of the currently authenticated user.
 * @param supabase Supabase client instance
 * @returns The user's roles as a string array, or empty array if not found
 */
export async function getUserRoles(
  supabase: SupabaseClient<Database>
): Promise<string[]> {
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    console.error("Error fetching user:", error?.message);
    return [];
  }

  // For development mode, provide admin role for testing
  if (process.env.NODE_ENV === 'development') {
    console.log("DEV MODE: Using fallback admin role");
    return ['admin']; 
  }

  // Primary source: app_metadata.roles array
  if (Array.isArray(user.app_metadata?.roles) && user.app_metadata.roles.length > 0) {
    return user.app_metadata.roles;
  }
  
  // Fallback: app_metadata.role string (converted to array)
  if (user.app_metadata?.role && typeof user.app_metadata.role === 'string') {
    return [user.app_metadata.role];
  }

  // Additional fallbacks for backward compatibility - convert all to array format
  const fallbackRoles: string[] = [];
  
  // Check user_metadata.role
  if (user.user_metadata?.role && typeof user.user_metadata.role === 'string') {
    fallbackRoles.push(user.user_metadata.role);
  }

  // If we found any roles in fallbacks, return them
  if (fallbackRoles.length > 0) {
    console.warn("Using fallback role location. Please migrate roles to app_metadata.roles");
    return fallbackRoles;
  }

  // Query database for roles if needed (expensive fallback)
  try {
    // Try employee table first
    const { data: employeeData, error: employeeError } = await supabase
      .from('employees')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (!employeeError && employeeData?.role) {
      console.warn("Using employee table for role. Please migrate roles to app_metadata.roles");
      return [employeeData.role];
    }

    // Try user_profiles table
    const { data: profileData, error: profileError } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (!profileError && profileData?.role) {
      console.warn("Using user_profiles table for role. Please migrate roles to app_metadata.roles");
      return [profileData.role];
    }
  } catch (err) {
    console.warn("Error querying database for roles:", err);
  }

  // Default role
  console.warn("No roles found, defaulting to 'user' role");
  return ['user'];
}

/**
 * Fetches the primary role of the currently authenticated user.
 * @param supabase Supabase client instance
 * @returns The user's primary role as a string, or 'user' if not found
 */
export async function getUserRole(
  supabase: SupabaseClient<Database>
): Promise<string> {
  const roles = await getUserRoles(supabase);
  return getPrimaryRole(roles);
}