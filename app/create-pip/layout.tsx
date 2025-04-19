"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import DashboardSidebar from "@/components/dashboard/dashboard-sidebar";
import { Loader2 } from "lucide-react";
import { getSessionWithRefresh, isSessionRefreshInProgress } from "@/lib/session-manager";

/**
 * This layout wraps all /create-pip routes.
 */
export default function CreatePipLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  
  // Check if we should bypass auth (only in development mode)
  const bypassAuth = process.env.NODE_ENV === 'development' && 
                     process.env.NEXT_PUBLIC_DEV_BYPASS_AUTH === 'true';

  // Session validation using centralized session manager
  useEffect(() => {
    if (loading) return;

    // If we already have a user or bypass is enabled, we can skip
    if (user || bypassAuth) {
      setIsLoading(false);
      return;
    }

    // If no user and not bypassing auth, redirect to login
    if (!user && !bypassAuth) {
      console.log('No user found in create-pip flow, redirecting to login');
      const currentPath = window.location.pathname;
      router.push(`/auth/login?redirect=${encodeURIComponent(currentPath)}`);
      return;
    }

    // Otherwise, check session but avoid refresh if one is in progress
    if (isSessionRefreshInProgress()) {
      console.log('Session refresh already in progress in another component, waiting...');
      // We'll continue loading and rely on Auth context to update
      setTimeout(() => setIsLoading(false), 1000);
      return;
    }

    // Validate session
    (async () => {
      try {
        const { data, error } = await getSessionWithRefresh();
        
        if (error) {
          console.error('Session validation error in create-pip layout:', error);
          // Only redirect on invalid session errors, not rate limiting
          if (error.message && error.message.includes('invalid') && !error.message.includes('rate limit')) {
            const currentPath = window.location.pathname;
            router.push(`/auth/login?redirect=${encodeURIComponent(currentPath)}`);
            return;
          }
        } else {
          console.log('Session validated in create-pip layout');
        }
      } catch (err) {
        console.error('Unexpected error in create-pip layout session check:', err);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [loading, user, bypassAuth, router]);

  // Show loading state
  if (loading || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        <span className="ml-2 text-xl">Loading...</span>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <DashboardSidebar />
      <div className="flex-1 overflow-auto">{children}</div>
    </div>
  );
}