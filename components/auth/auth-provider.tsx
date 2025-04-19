"use client";

import { ReactNode } from 'react';
import { AuthProvider as AuthContextProvider } from '@/hooks/useAuth';

type AuthProviderProps = {
  children: ReactNode;
};

/**
 * Auth Provider component that wraps the application with the authentication context.
 * This is a simplified wrapper around the actual implementation in the useAuth.tsx hook.
 */
export function AuthProvider({ children }: AuthProviderProps) {
  return (
    <AuthContextProvider>
      {children}
    </AuthContextProvider>
  );
}