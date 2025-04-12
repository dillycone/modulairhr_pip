import type { SupabaseClient, User } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';
import { shouldBypassAuth } from '@/lib/env';
import { UserRole, isValidUserRole } from '@/types/roles';
import { getUserRoles, getPrimaryRole } from './permissions';

/**
 * @deprecated Use getPrimaryRole from ./permissions.ts instead
 */
export function getPrimaryRole(roles: string[] | undefined): string {
  // For backward compatibility, handle undefined roles
  if (!roles || roles.length === 0) {
    return UserRole.USER;
  }
  
  // Filter to only valid roles
  const validRoles = roles.filter(isValidUserRole);
  
  // Priority order: ADMIN > MANAGER > TEMPLATE_EDITOR > USER
  if (validRoles.includes(UserRole.ADMIN)) return UserRole.ADMIN;
  if (validRoles.includes(UserRole.MANAGER)) return UserRole.MANAGER;
  if (validRoles.includes(UserRole.TEMPLATE_EDITOR)) return UserRole.TEMPLATE_EDITOR;
  
  return UserRole.USER;
}

/**
 * @deprecated Use userHasRole from ./permissions.ts instead
 */
export function userHasRole(user: User | null, role: string): boolean {
  // In development mode, can bypass auth checks
  if (shouldBypassAuth()) {
    return true;
  }
  
  if (!user) return false;
  
  // Check if the role is a valid UserRole
  if (!isValidUserRole(role)) {
    return false;
  }
  
  // Get the user roles and check if the required role is included
  const roles = user.app_metadata?.roles || [];
  return roles.includes(role);
}

/**
 * @deprecated Use getUserRoles from ./permissions.ts instead
 */
export async function getUserRoles(
  supabase: SupabaseClient<Database>
): Promise<string[]> {
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    console.error("Error fetching user:", error?.message);
    return [];
  }

  // For development mode
  if (shouldBypassAuth()) {
    return Object.values(UserRole);
  }

  // Get roles from user metadata
  return user.app_metadata?.roles || [UserRole.USER];
}

/**
 * @deprecated Use getPrimaryRole from ./permissions.ts instead
 */
export async function getUserRole(
  supabase: SupabaseClient<Database>
): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return '';
  
  // For development mode
  if (shouldBypassAuth()) {
    return UserRole.ADMIN;
  }
  
  // Get roles and determine primary role
  const roles = user.app_metadata?.roles || [];
  return getPrimaryRole(roles);
}