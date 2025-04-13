'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export default function AuthDebugPage() {
  const [localStorageData, setLocalStorageData] = useState<Record<string, string | null>>({});
  const [supabaseStatus, setSupabaseStatus] = useState<{ success: boolean; message: string } | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Get all auth-related localStorage items
    const items = {
      'loginAttempts': localStorage.getItem('loginAttempts'),
      'cooldownEnd': localStorage.getItem('cooldownEnd'),
      'lastAttemptTime': localStorage.getItem('lastAttemptTime'),
      'supabase.auth.token': localStorage.getItem('supabase.auth.token'),
      'sb-refresh-token': localStorage.getItem('sb-refresh-token'),
      'sb-access-token': localStorage.getItem('sb-access-token')
    };
    setLocalStorageData(items);
  }, []);

  const clearLoginRateLimitData = () => {
    localStorage.removeItem('loginAttempts');
    localStorage.removeItem('cooldownEnd');
    localStorage.removeItem('lastAttemptTime');
    
    // Refresh the displayed data
    setLocalStorageData({
      ...localStorageData,
      'loginAttempts': null,
      'cooldownEnd': null,
      'lastAttemptTime': null
    });
  };

  const checkSupabaseConnection = async () => {
    setIsChecking(true);
    try {
      // Check if we can connect to Supabase
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        setSupabaseStatus({
          success: false,
          message: `Error connecting to Supabase: ${error.message}`
        });
      } else {
        setSupabaseStatus({
          success: true,
          message: data.session ? 
            `Connected to Supabase. User is authenticated as ${data.session.user.email}` : 
            'Connected to Supabase. No active session.'
        });
      }
    } catch (error) {
      setSupabaseStatus({
        success: false,
        message: `Exception when connecting to Supabase: ${error instanceof Error ? error.message : String(error)}`
      });
    } finally {
      setIsChecking(false);
    }
  };

  const refreshSession = async () => {
    setIsChecking(true);
    try {
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) {
        setSupabaseStatus({
          success: false,
          message: `Error refreshing session: ${error.message}`
        });
      } else {
        setSupabaseStatus({
          success: true,
          message: data.session ? 
            `Session refreshed. User authenticated as ${data.session.user.email}` : 
            'Session refresh attempted, but no active session.'
        });
      }
    } catch (error) {
      setSupabaseStatus({
        success: false,
        message: `Exception when refreshing session: ${error instanceof Error ? error.message : String(error)}`
      });
    } finally {
      setIsChecking(false);
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setSupabaseStatus({
        success: true,
        message: 'Signed out successfully'
      });
      
      // Refresh the page after a short delay
      setTimeout(() => {
        router.refresh();
      }, 1000);
    } catch (error) {
      setSupabaseStatus({
        success: false,
        message: `Error signing out: ${error instanceof Error ? error.message : String(error)}`
      });
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">Authentication Debug</h1>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Client-Side State</CardTitle>
          <CardDescription>
            Authentication-related data stored in your browser
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div>
              <h3 className="font-medium">Rate Limiting Data:</h3>
              <pre className="bg-gray-100 p-2 rounded text-sm">
                {JSON.stringify({
                  loginAttempts: localStorageData['loginAttempts'],
                  cooldownEnd: localStorageData['cooldownEnd'],
                  lastAttemptTime: localStorageData['lastAttemptTime']
                }, null, 2)}
              </pre>
            </div>
            
            <div>
              <h3 className="font-medium">Supabase Auth State:</h3>
              <pre className="bg-gray-100 p-2 rounded text-sm">
                {JSON.stringify({
                  'supabase.auth.token': localStorageData['supabase.auth.token'] ? '[exists]' : null,
                  'sb-refresh-token': localStorageData['sb-refresh-token'] ? '[exists]' : null,
                  'sb-access-token': localStorageData['sb-access-token'] ? '[exists]' : null
                }, null, 2)}
              </pre>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={clearLoginRateLimitData}
            variant="outline"
            className="mr-2"
          >
            Clear Rate Limit Data
          </Button>
        </CardFooter>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Supabase Connection</CardTitle>
          <CardDescription>
            Test your connection to the Supabase authentication backend
          </CardDescription>
        </CardHeader>
        <CardContent>
          {supabaseStatus && (
            <div className={`p-3 rounded mb-4 ${supabaseStatus.success ? 'bg-green-100' : 'bg-red-100'}`}>
              <p className={supabaseStatus.success ? 'text-green-800' : 'text-red-800'}>
                {supabaseStatus.message}
              </p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-wrap gap-2">
          <Button 
            onClick={checkSupabaseConnection}
            disabled={isChecking}
          >
            {isChecking ? 'Checking...' : 'Check Connection'}
          </Button>
          <Button 
            onClick={refreshSession}
            disabled={isChecking}
            variant="outline"
          >
            Refresh Session
          </Button>
          <Button 
            onClick={signOut}
            disabled={isChecking}
            variant="destructive"
          >
            Sign Out
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Navigation</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-2">
          <Button onClick={() => router.push('/auth/login')} variant="outline">
            Go to Login
          </Button>
          <Button onClick={() => router.push('/dashboard')} variant="outline">
            Go to Dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  );
} 