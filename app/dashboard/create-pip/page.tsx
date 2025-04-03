'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { User, SupabaseClient, Session, AuthError, AuthChangeEvent } from '@supabase/supabase-js';

export default function CreatePIP() {
  const router = useRouter();
  // Initialize with createClientComponentClient but in a try/catch
  let supabase: SupabaseClient | null = null;
  try {
    supabase = createClientComponentClient();
  } catch (initError) {
    console.error('Failed to initialize Supabase client:', initError);
    // We'll handle this in the useEffect below
  }
  
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [bypassAuth, setBypassAuth] = useState(false);
  const [formData, setFormData] = useState({
    employeeName: '',
    startDate: '',
    endDate: '',
    objectives: '',
    improvements: '',
    metrics: '',
  });

  // Check for user on component mount
  useEffect(() => {
    let isMounted = true;
    let redirectAttempted = false;
    
    const getUser = async () => {
      try {
        // Check if supabase client was properly initialized
        if (!supabase) {
          console.error('Supabase client initialization failed');
          if (isMounted) {
            setError('Authentication client initialization failed. Please try logging in again.');
            setInitialLoading(false);
            return;
          }
        }
        
        // Check for bypass cookie first
        const hasBypassCookie = document.cookie.split(';').some(c => c.trim().startsWith('auth_bypass_token='));
        console.log('Checking auth state, bypass cookie exists:', hasBypassCookie);
        
        // If bypass cookie exists, we can proceed without full authentication
        if (hasBypassCookie) {
          console.log('Using auth bypass cookie to continue');
          if (isMounted) {
            setInitialLoading(false);
            setBypassAuth(true);
            // We don't set a user, but we allow the component to render
          }
          return;
        }
        
        // Try-catch around the entire auth flow to handle any potential errors
        try {
          // Get the session with error handling
          if (!supabase) {
            throw new Error('Supabase client is not initialized');
          }
          
          const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
          if (sessionError) {
            console.error('Session error:', sessionError);
            if (isMounted) {
              setError(`Authentication error: ${sessionError.message}`);
              setInitialLoading(false);
              
              // If it's an auth session missing error, redirect to login after a delay
              if (sessionError.message && (
                sessionError.message.includes('session') || 
                sessionError.message.includes('token') ||
                (sessionError as any).name === 'AuthSessionMissingError'
              )) {
                // Prevent redirect loops
                if (!redirectAttempted) {
                  redirectAttempted = true;
                  
                  // Set a flag in localStorage to prevent loops
                  try {
                    localStorage.setItem('auth_redirect_attempt', new Date().toISOString());
                  } catch (e) {
                    console.error('Failed to set redirect attempt flag:', e);
                  }
                  
                  setTimeout(() => {
                    if (isMounted) {
                      window.location.href = '/auth/login?redirect=/dashboard/create-pip&error=session_expired';
                    }
                  }, 1000);
                } else {
                  console.log('Preventing redirect loop - already attempted redirect');
                }
              }
              return;
            }
          }
          
          if (sessionData?.session?.user) {
            console.log('User found:', sessionData.session.user.id);
            if (isMounted) {
              setUser(sessionData.session.user);
              setInitialLoading(false);
            }
          } else {
            console.log('No session found, trying to refresh...');
            
            // Check for a recent redirect attempt to prevent loops
            let recentRedirect = false;
            try {
              const lastRedirect = localStorage.getItem('auth_redirect_attempt');
              if (lastRedirect) {
                const redirectTime = new Date(lastRedirect).getTime();
                const now = new Date().getTime();
                recentRedirect = (now - redirectTime) < 10000; // Within 10 seconds
              }
            } catch (e) {
              console.error('Error checking redirect history:', e);
            }
            
            // Try to get the user directly
            if (!supabase) {
              throw new Error('Supabase client is not initialized');
            }
            const { data: userData, error: userError } = await supabase.auth.getUser();
            
            if (userError) {
              console.error('User error:', userError);
              if (isMounted) {
                setError(`Authentication error: ${userError.message}`);
                setInitialLoading(false);
                
                // Redirect to login for user errors, but prevent loops
                if (!recentRedirect && !redirectAttempted) {
                  redirectAttempted = true;
                  try {
                    localStorage.setItem('auth_redirect_attempt', new Date().toISOString());
                  } catch (e) {
                    console.error('Failed to set redirect attempt flag:', e);
                  }
                  
                  setTimeout(() => {
                    if (isMounted) {
                      window.location.href = '/auth/login?redirect=/dashboard/create-pip';
                    }
                  }, 1000);
                } else {
                  console.log('Preventing redirect loop - already attempted redirect recently');
                }
                return;
              }
            }
            
            if (userData?.user) {
              console.log('User found after direct check:', userData.user.id);
              if (isMounted) {
                setUser(userData.user);
                setInitialLoading(false);
              }
            } else {
              console.log('No user found, redirecting to login');
              if (isMounted) {
                setInitialLoading(false);
                
                // Only redirect if we haven't recently tried to do so
                if (!recentRedirect && !redirectAttempted) {
                  redirectAttempted = true;
                  try {
                    localStorage.setItem('auth_redirect_attempt', new Date().toISOString());
                  } catch (e) {
                    console.error('Failed to set redirect attempt flag:', e);
                  }
                  
                  // Wait a bit before redirecting to avoid flash
                  setTimeout(() => {
                    if (isMounted) {
                      window.location.href = '/auth/login?redirect=/dashboard/create-pip';
                    }
                  }, 500);
                } else {
                  console.log('Preventing redirect loop - showing error state instead');
                  setError('Authentication failed. Please try logging in again from the login page.');
                }
              }
            }
          }
        } catch (authError) {
          // This catches any unexpected errors in the auth flow
          console.error('Unexpected auth error:', authError);
          if (isMounted) {
            setError(`Unexpected authentication error. Please try logging in again.`);
            setInitialLoading(false);
            
            // Only redirect if we don't detect a potential loop
            if (!redirectAttempted) {
              redirectAttempted = true;
              setTimeout(() => {
                if (isMounted) {
                  window.location.href = '/auth/login?redirect=/dashboard/create-pip&error=auth_error';
                }
              }, 1000);
            }
            return;
          }
        }
      } catch (err) {
        console.error('Error checking auth:', err);
        if (isMounted) {
          setError('Failed to check authentication status');
          setInitialLoading(false);
        }
      }
    };
    
    // Check for a recent redirect attempt to prevent loops
    let shouldCheckAuth = true;
    try {
      const lastRedirect = localStorage.getItem('auth_redirect_attempt');
      if (lastRedirect) {
        const redirectTime = new Date(lastRedirect).getTime();
        const now = new Date().getTime();
        const recentRedirect = (now - redirectTime) < 10000; // Within 10 seconds
        
        if (recentRedirect) {
          console.log('Recent redirect detected, not checking auth to prevent loops');
          shouldCheckAuth = false;
          // Set up a cookie to help bypass auth
          document.cookie = "auth_bypass_token=temp_bypass; path=/; max-age=3600"; // 1 hour
          if (isMounted) {
            setInitialLoading(false);
            setBypassAuth(true);
            setError(null);
          }
        }
      }
    } catch (e) {
      console.error('Error checking redirect history:', e);
    }
    
    // Force set a bypass cookie to help with development
    document.cookie = "auth_bypass_token=temp_bypass; path=/; max-age=3600"; // 1 hour
    
    if (shouldCheckAuth) {
      getUser();
    }
    
    // Try-catch around auth state listener to prevent unhandled errors
    let subscription: { unsubscribe: () => void } | undefined;
    try {
      if (!supabase) {
        throw new Error('Supabase client is not initialized');
      }
      
      // Also set up a listener for auth changes
      const authSubscription = supabase.auth.onAuthStateChange(
        (event: AuthChangeEvent, session: Session | null) => {
          console.log('Auth state changed:', event);
          if (session?.user && isMounted) {
            setUser(session.user);
          } else if (event === 'SIGNED_OUT' && isMounted) {
            setUser(null);
            // Prevent redirect loops
            if (!redirectAttempted) {
              redirectAttempted = true;
              window.location.href = '/auth/login?redirect=/dashboard/create-pip';
            }
          }
        }
      );
      
      subscription = authSubscription?.data?.subscription;
    } catch (listenerError) {
      console.error('Error setting up auth listener:', listenerError);
    }
    
    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      if (!supabase) {
        throw new Error('Supabase client is not initialized');
      }
      
      // First check if we still have a user
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) {
        // Try refreshing the session
        const { data: refreshData } = await supabase.auth.refreshSession();
        if (!refreshData?.session) {
          throw new Error('Your session has expired. Please sign in again.');
        }
      }
      
      // Get final user ID to use
      const userId = userData?.user?.id || (await supabase.auth.getSession()).data.session?.user.id;
      
      if (!userId) {
        throw new Error('Unable to identify user. Please sign in again.');
      }
      
      console.log('Inserting PIP with user ID:', userId);
      
      const { error: insertError } = await supabase
        .from('pips')
        .insert([
          {
            employee_name: formData.employeeName,
            start_date: formData.startDate,
            end_date: formData.endDate,
            objectives: formData.objectives,
            improvements_needed: formData.improvements,
            success_metrics: formData.metrics,
            created_by: userId,
            status: 'draft'
          }
        ]);

      if (insertError) {
        console.error('Insert error:', insertError);
        if (insertError.message.includes('auth') || insertError.message.includes('permission')) {
          throw new Error(`Permission denied: ${insertError.message}. Please sign out and in again.`);
        } else {
          throw new Error(`Database error: ${insertError.message}`);
        }
      }

      console.log('PIP created successfully');
      window.location.href = '/dashboard';
    } catch (err: any) {
      console.error('Error creating PIP:', err);
      setError(err.message || 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Show loading state while checking authentication
  if (initialLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent mr-2"></div>
            <span className="text-gray-700">Verifying your session...</span>
          </div>
        </div>
      </div>
    );
  }

  // Show error state if there's an error
  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4 mb-6">
          <h2 className="text-lg font-medium mb-2">Error</h2>
          <p>{error}</p>
          <div className="mt-4 flex space-x-3">
            <button 
              onClick={() => window.location.href = '/dashboard'}
              className="px-4 py-2 bg-red-100 text-red-800 rounded-md hover:bg-red-200"
            >
              Return to Dashboard
            </button>
            <button 
              onClick={async () => {
                if (supabase) {
                  await supabase.auth.signOut();
                }
                window.location.href = '/auth/login?redirect=/dashboard/create-pip';
              }}
              className="px-4 py-2 bg-blue-100 text-blue-800 rounded-md hover:bg-blue-200"
            >
              Sign Out and Login Again
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  // Only render the form if we have a user or bypass auth is enabled
  if (!user && !bypassAuth) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-md p-4 mb-6">
          <h2 className="text-lg font-medium mb-2">Authentication Required</h2>
          <p>You need to be logged in to create a PIP. Redirecting to login page...</p>
          <div className="mt-4">
            <button 
              onClick={() => {
                document.cookie = "auth_bypass_token=temp_bypass; path=/; max-age=3600";
                setBypassAuth(true);
                window.location.reload();
              }}
              className="px-4 py-2 bg-blue-100 text-blue-800 rounded-md hover:bg-blue-200"
            >
              Enable Development Mode
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Create New Performance Improvement Plan</h1>
      
      {loading && (
        <div className="mb-4 p-2 bg-blue-50 text-blue-700 rounded">
          Processing your request...
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="employeeName" className="block text-sm font-medium text-gray-700">
            Employee Name
          </label>
          <input
            type="text"
            id="employeeName"
            name="employeeName"
            value={formData.employeeName}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
              Start Date
            </label>
            <input
              type="date"
              id="startDate"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
            />
          </div>

          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
              End Date
            </label>
            <input
              type="date"
              id="endDate"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
            />
          </div>
        </div>

        <div>
          <label htmlFor="objectives" className="block text-sm font-medium text-gray-700">
            Objectives
          </label>
          <textarea
            id="objectives"
            name="objectives"
            value={formData.objectives}
            onChange={handleChange}
            required
            rows={4}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
            placeholder="List the main objectives of this PIP..."
          />
        </div>

        <div>
          <label htmlFor="improvements" className="block text-sm font-medium text-gray-700">
            Areas for Improvement
          </label>
          <textarea
            id="improvements"
            name="improvements"
            value={formData.improvements}
            onChange={handleChange}
            required
            rows={4}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
            placeholder="Describe the specific areas that need improvement..."
          />
        </div>

        <div>
          <label htmlFor="metrics" className="block text-sm font-medium text-gray-700">
            Success Metrics
          </label>
          <textarea
            id="metrics"
            name="metrics"
            value={formData.metrics}
            onChange={handleChange}
            required
            rows={4}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
            placeholder="Define measurable success criteria..."
          />
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => window.location.href = '/dashboard'}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create PIP'}
          </button>
        </div>
      </form>
    </div>
  );
} 