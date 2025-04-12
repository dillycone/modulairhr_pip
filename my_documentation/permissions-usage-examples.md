# Permissions System Usage Examples

## Overview

The application now has a structured and type-safe permissions system:

1. **Role-based access control** with predefined roles as an enum (`UserRole`)
2. **Permission-based access control** for more granular permissions (`PermissionAction`)
3. **HOCs** for route protection: `withAuth`, `withRole`, `withPermission`
4. **Hook-based utilities** for checking permissions in components: `usePermissions`

## Example 1: Protecting Routes

### Using Role-Based Protection

```tsx
import { UserRole } from '@/types/roles';
import { withRole } from '@/components/auth/with-auth';

function AdminDashboardPage() {
  return (
    <div>
      <h1>Admin Dashboard</h1>
      {/* ... */}
    </div>
  );
}

// Only allow ADMIN users to access this page
export default withRole(AdminDashboardPage, UserRole.ADMIN);
```

### Using Permission-Based Protection

```tsx
import { withPermission } from '@/components/auth/with-auth';

function TemplateEditorPage() {
  return (
    <div>
      <h1>Template Editor</h1>
      {/* ... */}
    </div>
  );
}

// Only allow users with template creation permission
export default withPermission(TemplateEditorPage, ['templates', 'create']);
```

## Example 2: Conditional Rendering in Components

```tsx
import { usePermissions } from '@/hooks/usePermissions';
import { UserRole } from '@/types/roles';

function DashboardActions() {
  const { hasRole, can, loading } = usePermissions();

  if (loading) return <div>Loading...</div>;

  return (
    <div className="actions">
      {/* Role-based rendering */}
      {hasRole(UserRole.ADMIN) && (
        <button className="admin-button">Admin Settings</button>
      )}

      {/* Permission-based rendering */}
      {can(['templates', 'create']) && (
        <button className="create-button">Create Template</button>
      )}

      {/* Always available actions */}
      <button className="view-button">View PIPs</button>
    </div>
  );
}
```

## Example 3: Checking Multiple Permissions

```tsx
import { usePermissions } from '@/hooks/usePermissions';

function TemplateCard({ template }) {
  const { can } = usePermissions();
  
  const canEdit = can(['templates', 'update']);
  const canDelete = can(['templates', 'delete']);
  
  return (
    <div className="template-card">
      <h3>{template.name}</h3>
      <p>{template.description}</p>
      
      <div className="actions">
        <button>View</button>
        {canEdit && <button>Edit</button>}
        {canDelete && <button>Delete</button>}
      </div>
    </div>
  );
}
```

## Example 4: Advanced - Using Primary Role for UI Customization

```tsx
import { usePermissions } from '@/hooks/usePermissions';
import { UserRole } from '@/types/roles';

function Dashboard() {
  const { primaryRole } = usePermissions();
  
  // Customize dashboard based on primary role
  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      
      {/* Different welcome message based on role */}
      {primaryRole === UserRole.ADMIN && <p>Welcome, Administrator!</p>}
      {primaryRole === UserRole.MANAGER && <p>Welcome, Manager!</p>}
      {primaryRole === UserRole.TEMPLATE_EDITOR && <p>Welcome, Template Editor!</p>}
      {primaryRole === UserRole.USER && <p>Welcome to your dashboard!</p>}
      
      {/* Different modules based on role */}
      <div className="dashboard-modules">
        {primaryRole === UserRole.ADMIN && <AdminModule />}
        {primaryRole === UserRole.MANAGER && <ManagerModule />}
        <UserModule /> {/* Available to all roles */}
      </div>
    </div>
  );
}
```