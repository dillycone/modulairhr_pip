"use client";

import { useAuth } from './useAuth';

/**
 * Hook for password reset and update functionality
 */
export function usePasswordReset() {
  const { resetPassword, updatePassword, loading, error } = useAuth();
  
  return {
    resetPassword,
    updatePassword,
    loading,
    error
  };
}