"use client";
import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

/**
 * This layout wraps all /dashboard routes, gating them by user session.
 * Child routes no longer need to check user themselves.
 */
export default function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      // If no user, go to login with redirect
      router.push("/auth/login?redirect=/dashboard");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mr-2"></div>
        <span>Loading dashboard...</span>
      </div>
    );
  }

  if (!user) {
    return null; // or some fallback while redirect occurs
  }

  // If we have a user, render the content
  return <div className="min-h-screen">{children}</div>;
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