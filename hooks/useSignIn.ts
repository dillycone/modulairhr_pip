"use client";

import { useAuth } from './useAuth';

/**
 * Hook for sign in functionality
 */
export function useSignIn() {
  const { signIn, loading, error } = useAuth();
  
  return {
    signIn,
    loading,
    error
  };
}