"use client";

import { useAuth } from './useAuth';

/**
 * Hook for accessing authenticated user and session
 */
export function useAuthUser() {
  const { user, session, loading, error } = useAuth();
  
  const isAuthenticated = !!session && !!user;
  
  return {
    user,
    session,
    loading,
    error,
    isAuthenticated
  };
}