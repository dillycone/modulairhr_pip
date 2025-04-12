# Permission System Documentation

## Overview

This document describes the role-based access control (RBAC) and permission system implemented in the application. The system provides both coarse-grained control through roles and fine-grained control through specific resource/action permissions.

## Core Concepts

### Roles

Roles are predefined sets of permissions that can be assigned to users. Each user can have multiple roles, with the highest-priority role being considered their "primary" role.

Available roles are defined as an enum for type safety:

```typescript
enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  MANAGER = 'manager',
  TEMPLATE_EDITOR = 'template_editor',
}
```

### Permissions

Permissions are specific access rights to perform actions on resources. They provide more granular control than roles.

Permissions are organized by resource and action:

```typescript
interface Permissions {
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
```

## Implementation Details

### Role and Permission Mapping

Each role has a default set of permissions defined in `DEFAULT_ROLE_PERMISSIONS`. The system combines permissions from all roles a user has, using OR logic (a user can perform an action if any of their roles allows it).

### User Metadata

Roles are stored in the user's `app_metadata.roles` array in Supabase Auth.

### Core Files

1. **`types/roles.ts`**: Defines the `UserRole` enum, permission interfaces, and permission action types
2. **`lib/utils/permissions.ts`**: Contains utility functions for checking roles and permissions
3. **`components/auth/with-auth.tsx`**: Higher-order components for protecting routes
4. **`hooks/usePermissions.ts`**: React hook for checking permissions in components

## Usage

### 1. Route Protection

You can protect routes using HOCs:

#### Role-Based Protection

```typescript
import { UserRole } from '@/types/roles';
import { withRole } from '@/components/auth/with-auth';

function AdminPage() {
  return <div>Admin content</div>;
}

export default withRole(AdminPage, UserRole.ADMIN);
```

#### Permission-Based Protection

```typescript
import { withPermission } from '@/components/auth/with-auth';

function TemplateEditorPage() {
  return <div>Template Editor</div>;
}

export default withPermission(TemplateEditorPage, ['templates', 'create']);
```

### 2. Component-Level Checks

Use the `usePermissions` hook for conditional rendering:

```typescript
import { usePermissions } from '@/hooks/usePermissions';

function ActionButtons() {
  const { can, hasRole, isAdmin } = usePermissions();
  
  return (
    <div>
      {/* Permission-based rendering */}
      {can(['templates', 'create']) && <button>Create Template</button>}
      
      {/* Role-based rendering */}
      {isAdmin && <button>Admin Settings</button>}
    </div>
  );
}
```

### 3. Backend API Checks

You can use the permission utilities in API routes:

```typescript
import { getUserRoles, hasPermission } from '@/lib/utils/permissions';

export async function POST(request: Request) {
  // Get user from session
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return new Response('Unauthorized', { status: 401 });
  }
  
  // Check if user can create templates
  if (!hasPermission(user, ['templates', 'create'])) {
    return new Response('Forbidden', { status: 403 });
  }
  
  // Process the request...
}
```

## Best Practices

1. **Use Enums for Type Safety**: Always use the `UserRole` enum rather than string literals
2. **Prefer Permission Checks**: Use granular permissions over role checks when possible
3. **Multiple Roles**: Be aware that users can have multiple roles with combined permissions
4. **HOCs for Routes**: Use HOCs at the page level for route protection
5. **Hook for Components**: Use the `usePermissions` hook for conditionally rendering UI elements

## Development Mode

In development, you can enable `shouldBypassAuth()` to automatically grant all permissions for testing purposes. This is controlled through the environment configuration in `lib/env.ts`.

## Extending the System

### Adding New Roles

1. Add the role to the `UserRole` enum in `types/roles.ts`
2. Define default permissions for that role in `DEFAULT_ROLE_PERMISSIONS`
3. Update priority logic in `getPrimaryRole` if needed

### Adding New Resources/Permissions

1. Extend the `Permissions` interface in `types/roles.ts`
2. Update the `PermissionAction` type to include the new resource/action combinations
3. Add the new permissions to each role in `DEFAULT_ROLE_PERMISSIONS`
4. Update `getEmptyPermissions` and `mergePermissions` functions to handle the new structure

## Backward Compatibility

The system maintains backward compatibility with existing code through:
- Legacy utility functions marked with `@deprecated` comments
- Automatic handling of string-based role checks
- Default role assignment for authenticated users