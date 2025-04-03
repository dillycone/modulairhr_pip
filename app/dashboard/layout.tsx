"use client";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

/**
 * This layout wraps all /dashboard routes. 
 */
export default function DashboardLayout({ children }: { children: ReactNode }) {
  // If we have a user, or if the user is guaranteed by the middleware, just render the content
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