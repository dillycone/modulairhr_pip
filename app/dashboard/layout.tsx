"use client";
import { cn } from "@/lib/utils";
import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import DashboardSidebar from "@/components/dashboard/dashboard-sidebar";
import { Loader2 } from "lucide-react";
import { getSessionWithRefresh, isSessionRefreshInProgress } from "@/lib/session-manager";

/**
 * This layout wraps all /dashboard routes. 
 */
export default function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // Check if we should bypass auth (only in development mode)
  const bypassAuth = process.env.NODE_ENV === 'development' && 
                     process.env.NEXT_PUBLIC_DEV_BYPASS_AUTH === 'true';

  // Validate session and handle auth redirects
  useEffect(() => {
    if (loading) return;

    // Skip auth check in development if flag is set
    if (bypassAuth) {
      console.log('Development mode: bypassing auth redirect in dashboard layout');
      return;
    }
    
    // If we already have a user, just skip validation
    if (user) {
      console.log('Skipping session refresh in layout to avoid rate limiting');
      return;
    }
    
    // If no user and not in development, redirect
    if (!user) {
      console.log('No user found in dashboard, redirecting to login');
      const currentPath = window.location.pathname;
      router.push(`/auth/login?redirect=${encodeURIComponent(currentPath)}`);
    }
  }, [user, loading, router, bypassAuth]);

  // Show loading when necessary
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

/**
 * Using this layout requires your /dashboard/page.tsx
 * or /dashboard/other.tsx to be children of /dashboard/layout.tsx
 * e.g. pages:
 *  - app/dashboard/layout.tsx
 *  - app/dashboard/page.tsx
 *  - app/dashboard/create-pip/page.tsx
 * and so on.
 * This eliminates the repeated logic for session gating.
 */ 