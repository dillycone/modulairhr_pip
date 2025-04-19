import { supabase } from "@/lib/supabase";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { NextRequest } from "next/server";
import { refreshSession, getSessionWithRefresh, isSessionRefreshInProgress } from "@/lib/session-manager";

/**
 * For client-side session refresh.
 * Provide user, bypassAuth flag, and a router object (from useRouter).
 * If no user and not bypassing auth, we redirect to login.
 * Else, we use the centralized session manager to refresh.
 */
interface RefreshClientOptions {
  user: any;
  bypassAuth?: boolean;
  router: any;
}

export async function refreshUserSession({ user, bypassAuth, router }: RefreshClientOptions) {
  // If there's no user and not bypassing auth, redirect
  if (!user && !bypassAuth) {
    console.log('No user found in create-pip flow, redirecting to login');
    const currentPath = window.location.pathname;
    router.push(`/auth/login?redirect=${encodeURIComponent(currentPath)}`);
    return { message: 'redirected' };
  }

  // Check if refresh is already in progress to avoid duplicate calls
  if (isSessionRefreshInProgress()) {
    console.log('Session refresh already in progress, skipping duplicate call');
    return { message: 'refresh in progress' };
  }

  try {
    // Use centralized session manager to handle refresh
    const { data, error } = await refreshSession();
    return error || null; // Return null if no error
  } catch (err) {
    return err;
  }
}

/**
 * For server-side session refresh (API routes).
 * Provide the NextRequest, then call createServerSupabaseClient with { req } for cookies.
 */
export async function refreshServerSession(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient({ req });
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error) {
      return {
        status: 500,
        body: {
          success: false,
          message: 'Error checking session',
          error: error.message
        }
      };
    }
    if (!session) {
      return {
        status: 401,
        body: {
          success: false,
          message: 'No active session found',
          needsLogin: true
        }
      };
    }

    // Server-side refreshes still use the direct method since they don't share
    // localStorage with client-side refreshes
    const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
    if (refreshError) {
      // Handle rate-limiting
      if (
        refreshError.message.includes('rate limit') ||
        refreshError.message.includes('too many requests')
      ) {
        return {
          status: 429,
          body: {
            success: false,
            message: 'Rate limited by Supabase auth service',
            rateLimited: true,
            retryAfterSeconds: 300
          }
        };
      }
      return {
        status: 500,
        body: {
          success: false,
          message: 'Failed to refresh session',
          error: refreshError.message
        }
      };
    }

    return {
      status: 200,
      body: {
        success: true,
        message: 'Session refreshed successfully (unified helper)',
        user: {
          id: refreshData.user?.id,
          email: refreshData.user?.email,
          role: refreshData.user?.app_metadata?.role || 'user'
        }
      }
    };
  } catch (err: any) {
    return {
      status: 500,
      body: {
        success: false,
        message: 'Server error',
        error: err.message
      }
    };
  }
}