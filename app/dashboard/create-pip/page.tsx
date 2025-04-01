'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { User } from '@supabase/supabase-js';

export default function CreatePIP() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
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
    
    const getUser = async () => {
      try {
        // Get the session - not getUser as it might not be available immediately in some OAuth providers
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          if (isMounted) {
            setError(`Authentication error: ${sessionError.message}`);
            setInitialLoading(false);
          }
          return;
        }
        
        if (sessionData?.session?.user) {
          console.log('User found:', sessionData.session.user.id);
          if (isMounted) {
            setUser(sessionData.session.user);
            setInitialLoading(false);
          }
        } else {
          console.log('No session found, trying to refresh...');
          
          // Try to get the user directly
          const { data: userData, error: userError } = await supabase.auth.getUser();
          
          if (userError) {
            console.error('User error:', userError);
            if (isMounted) {
              setError(`Authentication error: ${userError.message}`);
              setInitialLoading(false);
            }
            return;
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
              // Wait a bit before redirecting to avoid flash
              setTimeout(() => {
                router.push('/auth/login?redirect=/dashboard/create-pip');
              }, 500);
            }
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
    
    getUser();
    
    // Also set up a listener for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event);
        if (session?.user && isMounted) {
          setUser(session.user);
        } else if (event === 'SIGNED_OUT' && isMounted) {
          setUser(null);
          router.push('/auth/login?redirect=/dashboard/create-pip');
        }
      }
    );
    
    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [router, supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
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
      router.push('/dashboard');
      router.refresh();
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
              onClick={() => router.push('/dashboard')}
              className="px-4 py-2 bg-red-100 text-red-800 rounded-md hover:bg-red-200"
            >
              Return to Dashboard
            </button>
            <button 
              onClick={async () => {
                await supabase.auth.signOut();
                router.push('/auth/login?redirect=/dashboard/create-pip');
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
  
  // Only render the form if we have a user
  if (!user) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-md p-4 mb-6">
          <h2 className="text-lg font-medium mb-2">Authentication Required</h2>
          <p>You need to be logged in to create a PIP. Redirecting to login page...</p>
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
            onClick={() => router.back()}
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