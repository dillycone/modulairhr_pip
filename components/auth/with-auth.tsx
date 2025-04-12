import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { UserRole, PermissionAction } from '@/types/roles';
import { userHasRole, hasPermission } from '@/lib/utils/permissions';

/**
 * Higher-order component that wraps a component and ensures 
 * the user is authenticated before rendering it.
 */
export function withAuth<P extends object>(Component: React.ComponentType<P>) {
  return function WithAuth(props: P & JSX.IntrinsicAttributes) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      // Skip if still loading
      if (loading) {
        return;
      }

      // If user is not authenticated, redirect to login
      if (!user) {
        // Get the current path to redirect back after login
        const path = window.location.pathname;
        router.push(`/auth/login?redirect=${encodeURIComponent(path)}`);
      }
    }, [user, loading, router]);

    // Only render the component if we have a user
    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      );
    }

    if (!user) {
      return null;
    }

    return <Component {...props} />;
  };
}

/**
 * HOC that wraps a component and ensures the user has the required role
 * before rendering it.
 */
export function withRole<P extends object>(Component: React.ComponentType<P>, requiredRole: UserRole) {
  return function WithRole(props: P & JSX.IntrinsicAttributes) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      // Skip if still loading
      if (loading) {
        return;
      }

      // If user is not authenticated, redirect to login
      if (!user) {
        const path = window.location.pathname;
        router.push(`/auth/login?redirect=${encodeURIComponent(path)}`);
        return;
      }

      // Check if user has required role
      if (!userHasRole(user, requiredRole)) {
        // User doesn't have permission, redirect to access denied
        router.push('/access-denied');
      }
    }, [user, loading, router]);

    // Show loading while checking auth
    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      );
    }

    // Don't render anything if no user or missing role
    if (!user || !userHasRole(user, requiredRole)) {
      return null;
    }

    return <Component {...props} />;
  };
}

/**
 * HOC that wraps a component and ensures the user has the required permission
 * before rendering it.
 */
export function withPermission<P extends object>(
  Component: React.ComponentType<P>, 
  requiredPermission: PermissionAction
) {
  return function WithPermission(props: P & JSX.IntrinsicAttributes) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      // Skip if still loading
      if (loading) {
        return;
      }

      // If user is not authenticated, redirect to login
      if (!user) {
        const path = window.location.pathname;
        router.push(`/auth/login?redirect=${encodeURIComponent(path)}`);
        return;
      }

      // Check if user has required permission
      if (!hasPermission(user, requiredPermission)) {
        // User doesn't have permission, redirect to access denied
        router.push('/access-denied');
      }
    }, [user, loading, router]);

    // Show loading while checking auth
    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      );
    }

    // Don't render anything if no user or missing permission
    if (!user || !hasPermission(user, requiredPermission)) {
      return null;
    }

    return <Component {...props} />;
  };
}