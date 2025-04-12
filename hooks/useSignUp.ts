"use client";

import { useAuth } from './useAuth';

/**
 * Hook for sign up functionality
 */
export function useSignUp() {
  const { signUp, loading, error } = useAuth();
  
  return {
    signUp,
    loading,
    error
  };
}