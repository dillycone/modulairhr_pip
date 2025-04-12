# Authentication Hooks

This directory contains authentication hooks for the application. The hooks are organized to follow separation of concerns and to avoid a large monolithic hook.

## Structure

### Core Provider

- `useAuth.ts` - Defines the `AuthProvider` and core `useAuth` hook that provides centralized auth state and functions.

### Specialized Hooks

These hooks use the core `useAuth` hook and provide a more focused API for specific auth tasks:

- `useSignIn.ts` - Hook for handling user sign in
- `useSignUp.ts` - Hook for handling user registration
- `usePasswordReset.ts` - Hook for password reset and update functionality
- `useAuthUser.ts` - Hook for accessing authenticated user data and session

## Usage

1. Wrap your application with the `AuthProvider`:

```tsx
// In your root layout:
import { AuthProvider } from '@/components/auth/auth-provider';

export default function RootLayout({ children }) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}
```

2. Use the specialized hooks in your components:

```tsx
// For sign in functionality
import { useSignIn } from '@/hooks/useSignIn';

function LoginComponent() {
  const { signIn, error, loading } = useSignIn();
  
  async function handleLogin(email, password) {
    const { error } = await signIn({ email, password });
    if (!error) {
      // Sign in successful
    }
  }
  
  return (
    // Your component JSX
  );
}
```

3. Access user information:

```tsx
import { useAuthUser } from '@/hooks/useAuthUser';

function ProfileComponent() {
  const { user, isAuthenticated, loading } = useAuthUser();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return <div>Please sign in</div>;
  }
  
  return (
    <div>
      <h1>Welcome, {user.email}</h1>
      {/* Other profile content */}
    </div>
  );
}
```

## Benefits of This Approach

- **Separation of Concerns**: Each hook focuses on specific functionality
- **Code Organization**: Keeps related code together
- **Reduced Cognitive Load**: Components only import what they need
- **Improved Testability**: Smaller, more focused units of code are easier to test
- **Better Developer Experience**: More intuitive and easier to discover API