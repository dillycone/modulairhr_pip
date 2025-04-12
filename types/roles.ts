/**
 * Enumeration of available user roles in the system.
 * This ensures type safety when checking roles.
 */
export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  MANAGER = 'manager',
  TEMPLATE_EDITOR = 'template_editor',
}

/**
 * Permission interface for granular access control.
 * Permissions are grouped by resource and contain specific actions.
 */
export interface Permissions {
  pips: {
    create: boolean;
    read: boolean;
    update: boolean;
    delete: boolean;
    share: boolean;
  };
  templates: {
    create: boolean;
    read: boolean;
    update: boolean;
    delete: boolean;
  };
  users: {
    read: boolean;
    invite: boolean;
    manage: boolean;
  };
  organizations: {
    manage: boolean;
  };
}

/**
 * Default permissions mapping for each role.
 * This provides a centralized definition of what each role can do.
 */
export const DEFAULT_ROLE_PERMISSIONS: Record<UserRole, Permissions> = {
  [UserRole.USER]: {
    pips: {
      create: true,
      read: true,
      update: true,
      delete: true,
      share: false,
    },
    templates: {
      create: false,
      read: true,
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
  },
  [UserRole.MANAGER]: {
    pips: {
      create: true,
      read: true,
      update: true,
      delete: true,
      share: true,
    },
    templates: {
      create: false,
      read: true,
      update: false,
      delete: false,
    },
    users: {
      read: true,
      invite: true,
      manage: false,
    },
    organizations: {
      manage: false,
    },
  },
  [UserRole.TEMPLATE_EDITOR]: {
    pips: {
      create: true,
      read: true,
      update: true,
      delete: true,
      share: true,
    },
    templates: {
      create: true,
      read: true,
      update: true,
      delete: true,
    },
    users: {
      read: false,
      invite: false,
      manage: false,
    },
    organizations: {
      manage: false,
    },
  },
  [UserRole.ADMIN]: {
    pips: {
      create: true,
      read: true,
      update: true,
      delete: true,
      share: true,
    },
    templates: {
      create: true,
      read: true,
      update: true,
      delete: true,
    },
    users: {
      read: true,
      invite: true,
      manage: true,
    },
    organizations: {
      manage: true,
    },
  },
};

/**
 * Type guard to check if a string is a valid UserRole
 */
export function isValidUserRole(role: string): role is UserRole {
  return Object.values(UserRole).includes(role as UserRole);
}

/**
 * Type to represent a resource and action tuple for permission checking
 * Example: ['pips', 'create'] or ['templates', 'update']
 */
export type PermissionAction = 
  | ['pips', keyof Permissions['pips']] 
  | ['templates', keyof Permissions['templates']]
  | ['users', keyof Permissions['users']]
  | ['organizations', keyof Permissions['organizations']];