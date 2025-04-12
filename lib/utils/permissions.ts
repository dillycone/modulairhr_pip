import { User } from '@supabase/supabase-js';
import { 
  UserRole, 
  Permissions, 
  DEFAULT_ROLE_PERMISSIONS, 
  PermissionAction,
  isValidUserRole
} from '@/types/roles';
import { shouldBypassAuth } from '@/lib/env';

/**
 * Gets all roles assigned to a user
 * @param user Supabase user object
 * @returns Array of user roles
 */
export function getUserRoles(user: User | null): UserRole[] {
  if (!user) return [];
  
  // In development mode, can bypass auth checks
  if (shouldBypassAuth()) {
    return [UserRole.ADMIN];
  }
  
  // Extract roles from user metadata
  const roles = user.app_metadata?.roles || [];
  
  // Filter to only valid roles and cast to UserRole enum
  return roles
    .filter(isValidUserRole)
    .map(role => role as UserRole);
}

/**
 * Gets the primary role for a user
 * @param user Supabase user object
 * @returns The highest priority role, or USER as default
 */
export function getPrimaryRole(user: User | null): UserRole {
  const roles = getUserRoles(user);
  
  // Priority order: ADMIN > MANAGER > TEMPLATE_EDITOR > USER
  if (roles.includes(UserRole.ADMIN)) return UserRole.ADMIN;
  if (roles.includes(UserRole.MANAGER)) return UserRole.MANAGER;
  if (roles.includes(UserRole.TEMPLATE_EDITOR)) return UserRole.TEMPLATE_EDITOR;
  
  return UserRole.USER;
}

/**
 * Checks if a user has a specific role
 * @param user Supabase user object
 * @param role Role to check for
 * @returns Boolean indicating if user has the role
 */
export function userHasRole(user: User | null, role: UserRole): boolean {
  if (!user) return false;
  
  // In development mode, can bypass auth checks
  if (shouldBypassAuth()) {
    return true;
  }
  
  const roles = getUserRoles(user);
  return roles.includes(role);
}

/**
 * Gets permissions for a user based on their roles
 * @param user Supabase user object
 * @returns Permissions object
 */
export function getUserPermissions(user: User | null): Permissions {
  if (!user) {
    return getEmptyPermissions();
  }
  
  // In development mode, can bypass auth checks
  if (shouldBypassAuth()) {
    return DEFAULT_ROLE_PERMISSIONS[UserRole.ADMIN];
  }
  
  const roles = getUserRoles(user);
  
  // Start with empty permissions
  let permissions = getEmptyPermissions();
  
  // Combine permissions from all roles
  roles.forEach(role => {
    const rolePermissions = DEFAULT_ROLE_PERMISSIONS[role];
    permissions = mergePermissions(permissions, rolePermissions);
  });
  
  return permissions;
}

/**
 * Checks if a user has permission to perform a specific action
 * @param user Supabase user object
 * @param action Permission action tuple [resource, action]
 * @returns Boolean indicating if user has permission
 */
export function hasPermission(user: User | null, action: PermissionAction): boolean {
  if (!user) return false;
  
  // In development mode, can bypass auth checks
  if (shouldBypassAuth()) {
    return true;
  }
  
  const [resource, actionName] = action;
  const permissions = getUserPermissions(user);
  
  // @ts-ignore - TypeScript can't infer the nested access here
  return !!permissions[resource]?.[actionName];
}

/**
 * Creates an empty permissions object
 * @returns Permissions with all values set to false
 */
function getEmptyPermissions(): Permissions {
  return {
    pips: {
      create: false,
      read: false,
      update: false,
      delete: false,
      share: false,
    },
    templates: {
      create: false,
      read: false,
      update: false,
      delete: false,
    },
    users: {
      read: false,
      invite: false,
      manage: false,
    },
    organizations: {
      manage: false,
    },
  };
}

/**
 * Merges two permission objects, using OR logic
 * @param base Base permissions object
 * @param override Permissions to merge in
 * @returns New merged permissions object
 */
function mergePermissions(base: Permissions, override: Permissions): Permissions {
  const result = { ...base };
  
  // For each resource in permissions
  Object.keys(result).forEach(resource => {
    const resourceKey = resource as keyof Permissions;
    
    // For each action in the resource
    Object.keys(result[resourceKey]).forEach(action => {
      const actionKey = action as keyof typeof result[typeof resourceKey];
      
      // @ts-ignore - TypeScript can't infer the nested access here
      result[resourceKey][actionKey] = base[resourceKey][actionKey] || override[resourceKey][actionKey];
    });
  });
  
  return result;
}