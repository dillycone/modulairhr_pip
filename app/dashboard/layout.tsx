"use client";
import { cn } from "@/lib/utils";
import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import DashboardSidebar from "@/components/dashboard/dashboard-sidebar";

/**
 * This layout wraps all /dashboard routes. 
 */
export default function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { user, loading } = useAuth();

  // Redirect to login if user is not authenticated
  useEffect(() => {
    // Skip auth check in development
    const isDevelopment = process.env.NODE_ENV === 'development';
    if (isDevelopment) {
      console.log('Development mode: bypassing auth redirect in dashboard layout');
      return;
    }
    
    if (!loading && !user) {
      console.log('No user found in dashboard, redirecting to login');
      const currentPath = window.location.pathname;
      router.push(`/auth/login?redirect=${encodeURIComponent(currentPath)}`);
    }
  }, [user, loading, router]);

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