"use client";

import { useAuth } from './useAuth';
import { UserRole, PermissionAction } from '@/types/roles';
import { 
  getUserRoles, 
  getPrimaryRole, 
  userHasRole,
  getUserPermissions,
  hasPermission
} from '@/lib/utils/permissions';

/**
 * A hook to check permissions and roles for the current user
 */
export function usePermissions() {
  const { user, loading } = useAuth();
  
  return {
    // Loading state
    loading,
    
    // Role checks
    roles: user ? getUserRoles(user) : [],
    primaryRole: user ? getPrimaryRole(user) : UserRole.USER,
    hasRole: (role: UserRole) => user ? userHasRole(user, role) : false,
    isAdmin: user ? userHasRole(user, UserRole.ADMIN) : false,
    
    // Permission checks
    permissions: user ? getUserPermissions(user) : null,
    can: (action: PermissionAction) => user ? hasPermission(user, action) : false,
  };
}