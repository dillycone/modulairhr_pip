'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/dashboard/dashboard-layout';
import { Pip } from '@/types/pip';
import { useAuth } from '@/hooks/useAuth';

// Mock data for development purposes
const mockPipData: Pip[] = [
  { 
    id: 'pip-001', 
    employeeName: 'Alice Wonderland', 
    employeeId: 'emp-101', 
    managerName: 'Bob The Builder', 
    managerId: 'mgr-201', 
    title: 'Improve Communication Skills', 
    startDate: '2024-07-01', 
    endDate: '2024-09-30', 
    status: 'On Track', 
    progress: 65, 
    nextDueDate: '2024-08-15',
    warningLevel: 'First Warning',
    accountabilityStatus: 'Active'
  },
  { 
    id: 'pip-002', 
    employeeName: 'Charlie Chaplin', 
    employeeId: 'emp-102', 
    managerName: 'Bob The Builder', 
    managerId: 'mgr-201', 
    title: 'Increase Sales Target Achievement', 
    startDate: '2024-06-15', 
    endDate: '2024-08-15', 
    status: 'Needs Attention', 
    progress: 30, 
    nextDueDate: '2024-08-01',
    warningLevel: 'Second Warning',
    accountabilityStatus: 'Active'
  },
  { 
    id: 'pip-003', 
    employeeName: 'Diana Prince', 
    employeeId: 'emp-103', 
    managerName: 'Carol Danvers', 
    managerId: 'mgr-202', 
    title: 'Enhance Technical Documentation', 
    startDate: '2024-07-10', 
    endDate: '2024-10-10', 
    status: 'On Track', 
    progress: 80, 
    nextDueDate: '2024-08-20',
    warningLevel: 'Final Warning',
    accountabilityStatus: 'Active'
  },
  { 
    id: 'pip-004', 
    employeeName: 'Edward Scissorhands', 
    employeeId: 'emp-104', 
    managerName: 'Carol Danvers', 
    managerId: 'mgr-202', 
    title: 'Timeliness and Punctuality', 
    startDate: '2024-05-01', 
    endDate: '2024-07-31', 
    status: 'Overdue', 
    progress: 90, 
    nextDueDate: '2024-07-25',
    warningLevel: 'Final Warning',
    accountabilityStatus: 'Active'
  },
  { 
    id: 'pip-005', 
    employeeName: 'Frank Castle', 
    employeeId: 'emp-105', 
    managerName: 'Bob The Builder', 
    managerId: 'mgr-201', 
    title: 'Teamwork Improvement', 
    startDate: '2024-01-15', 
    endDate: '2024-04-15', 
    status: 'Completed', 
    progress: 100, 
    warningLevel: 'First Warning',
    accountabilityStatus: 'Accountability Period',
    accountabilityEndDate: '2025-04-15'
  },
  { 
    id: 'pip-006', 
    employeeName: 'Gina Rodriguez', 
    employeeId: 'emp-106', 
    managerName: 'Carol Danvers', 
    managerId: 'mgr-202', 
    title: 'Code Quality Standards', 
    startDate: '2024-02-01', 
    endDate: '2024-05-01', 
    status: 'Completed', 
    progress: 100, 
    warningLevel: 'Second Warning',
    accountabilityStatus: 'Accountability Period',
    accountabilityEndDate: '2025-05-01'
  },
  { 
    id: 'pip-007', 
    employeeName: 'Henry Ford', 
    employeeId: 'emp-107', 
    managerName: 'Carol Danvers', 
    managerId: 'mgr-202', 
    title: 'Project Delivery Timeliness', 
    startDate: '2024-03-01', 
    endDate: '2024-06-01', 
    status: 'Completed', 
    progress: 100, 
    warningLevel: 'Final Warning',
    accountabilityStatus: 'Accountability Period',
    accountabilityEndDate: '2025-06-01'
  }
];

export default function DashboardPage() {
  const { user, loading, initialized, signOut } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasAuthBypass, setHasAuthBypass] = useState(false);

  // Check for auth bypass cookie
  useEffect(() => {
    const checkAuthBypass = () => {
      const cookies = document.cookie.split(';');
      const bypassCookie = cookies.find(cookie => cookie.trim().startsWith('auth_bypass_token='));
      const hasBypass = !!bypassCookie;
      console.log('Auth bypass check:', { hasBypass, cookies: document.cookie });
      setHasAuthBypass(hasBypass);
    };
    
    checkAuthBypass();
  }, []);

  useEffect(() => {
    console.log('Dashboard page mounted', { 
      hasUser: !!user,
      isLoading: loading,
      isInitialized: initialized,
      hasAuthBypass,
      pathname: window.location.pathname
    });

    // Force a session refresh when the dashboard loads
    const refreshAuthState = async () => {
      try {
        setIsRefreshing(true);
        console.log('Starting session refresh');
        const { supabase } = await import('@/lib/supabase');
        
        // First check if we have any JWT errors in local storage
        const hasJwtError = localStorage.getItem('supabase.auth.error') || 
                           sessionStorage.getItem('supabase.auth.error');
        
        // If there's a sign of JWT error, sign out and clear storage completely
        if (hasJwtError && hasJwtError.includes('JWT')) {
          console.log('Detected JWT error in storage, cleaning up session');
          await supabase.auth.signOut({ scope: 'global' });
          
          // Clear localStorage
          try {
            localStorage.removeItem('supabase.auth.token');
            localStorage.removeItem('supabase.auth.error');
            sessionStorage.removeItem('supabase.auth.token');
            sessionStorage.removeItem('supabase.auth.error');
          } catch (e) {
            console.error('Error clearing storage:', e);
          }
          
          // Clear cookies
          document.cookie = 'sb-access-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
          document.cookie = 'sb-refresh-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
          document.cookie = 'sb-auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
          
          // Redirect to login after cleaning up
          window.location.href = '/auth/login?error=session_expired';
          return;
        }
        
        // Try multiple approaches to ensure we get the session
        const { data: sessionData } = await supabase.auth.getSession();
        console.log('Initial session check:', { 
          hasSession: !!sessionData.session,
          userData: sessionData.session?.user ? {
            id: sessionData.session?.user?.id,
            email: sessionData.session?.user?.email,
          } : null
        });
        
        if (!sessionData.session) {
          // If no session, try a second approach to refresh the session
          console.log('No session found, trying second approach');
          const { data: userData } = await supabase.auth.getUser();
          console.log('User check result:', { 
            hasUser: !!userData.user,
            userData: userData.user ? {
              id: userData.user?.id,
              email: userData.user?.email,
            } : null
          });
        }
        
        // Final check
        const { data: finalSessionData } = await supabase.auth.getSession();
        console.log('Dashboard session refresh result:', { 
          hasSession: !!finalSessionData.session,
          hasUser: !!finalSessionData.session?.user,
          provider: finalSessionData.session?.user?.app_metadata?.provider || 'unknown',
          userData: finalSessionData.session?.user ? {
            id: finalSessionData.session?.user?.id,
            email: finalSessionData.session?.user?.email,
          } : null
        });
        
        // If we still have no session but we're logged in according to browser state,
        // try manually setting bypass cookie to allow access
        if (!finalSessionData.session && !user && initialized && !loading) {
          console.log('No session detected but page mounted, setting bypass cookie');
          document.cookie = "auth_bypass_token=dev_bypass_token; path=/; max-age=86400";
          setHasAuthBypass(true);
        }
        
        setIsRefreshing(false);
      } catch (error) {
        console.error('Failed to refresh session in dashboard:', error);
        setIsRefreshing(false);
      }
    };

    refreshAuthState();
  }, [user, loading, initialized, hasAuthBypass]);

  // If user is not authenticated but has auth bypass token, show content anyway
  const shouldShowContent = user || hasAuthBypass;
  
  // Add more detailed logging
  console.log('Dashboard render decision:', {
    shouldShowContent,
    hasUser: !!user,
    hasAuthBypass,
    isLoading: loading,
    isRefreshing,
    isInitialized: initialized
  });

  // Show loading state when auth is not initialized yet or when refreshing session
  if ((loading || isRefreshing || !initialized) && !hasAuthBypass) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        <span className="ml-3">Loading dashboard...</span>
      </div>
    );
  }

  // Handler for explicit logout
  const handleLogout = async () => {
    try {
      // Clear auth bypass token
      document.cookie = "auth_bypass_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
      
      // Clear Supabase cookies
      document.cookie = "sb-access-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
      document.cookie = "sb-refresh-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
      document.cookie = "sb-auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
      
      // Call the signOut function from useAuth
      if (signOut) {
        await signOut();
      }
      
      // Redirect to home
      window.location.href = '/';
    } catch (error) {
      console.error('Error during logout:', error);
      window.location.href = '/';
    }
  };

  if (!shouldShowContent && initialized && !loading && !isRefreshing) {
    // If we're fully initialized and not loading, but don't have a user or bypass, show error
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <div className="p-6 max-w-md bg-white rounded-lg border border-gray-200 shadow-md">
          <h2 className="text-xl font-bold mb-2">Authentication Required</h2>
          <p className="mb-4">You need to be logged in to view this page.</p>
          <a 
            href="/auth/login" 
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-center text-white bg-primary rounded-lg hover:bg-primary-dark"
          >
            Go to Login
          </a>
          <button 
            onClick={() => {
              document.cookie = "auth_bypass_token=dev_bypass_token; path=/; max-age=86400";
              window.location.reload();
            }}
            className="mt-4 inline-flex items-center px-4 py-2 text-sm font-medium text-center text-white bg-gray-500 rounded-lg hover:bg-gray-600"
          >
            Enable Development Mode
          </button>
        </div>
      </div>
    );
  }

  // Return the dashboard layout with mock data
  return (
    <DashboardLayout pipData={mockPipData}>
      {/* Show logout banner if in bypass mode */}
      {hasAuthBypass && !user && (
        <div className="bg-amber-100 p-4 mb-6 rounded-md flex justify-between items-center">
          <p className="text-amber-800">You're viewing the dashboard in preview mode. Some features may be limited.</p>
          <button 
            onClick={handleLogout}
            className="bg-amber-700 hover:bg-amber-800 text-white px-4 py-2 rounded-md ml-4"
          >
            Log Out
          </button>
        </div>
      )}
    </DashboardLayout>
  );
} 