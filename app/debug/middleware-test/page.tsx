'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';

export default function MiddlewareTestPage() {
  const router = useRouter();
  const [status, setStatus] = useState<'checking' | 'authenticated' | 'unauthenticated'>('checking');
  const [user, setUser] = useState<any>(null);
  const [middlewareInfo, setMiddlewareInfo] = useState<{
    cookies: Record<string, string>;
    headers: Record<string, string>;
  } | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error checking session:', error);
          setStatus('unauthenticated');
          return;
        }
        
        if (data.session) {
          setStatus('authenticated');
          setUser(data.session.user);
        } else {
          setStatus('unauthenticated');
        }
      } catch (error) {
        console.error('Exception checking session:', error);
        setStatus('unauthenticated');
      }
    };
    
    checkAuth();
  }, []);

  useEffect(() => {
    // Read cookies
    const getCookies = () => {
      const cookieObj: Record<string, string> = {};
      document.cookie.split(';').forEach(cookie => {
        const [name, value] = cookie.trim().split('=');
        cookieObj[name] = value;
      });
      return cookieObj;
    };

    setMiddlewareInfo({
      cookies: getCookies(),
      headers: {} // We can't directly access request headers in client-side code
    });
  }, []);

  const testEndpoint = async (endpoint: string) => {
    try {
      const response = await fetch(endpoint);
      const data = await response.json();
      return { success: response.ok, status: response.status, data };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  };

  const testProtectedEndpoint = async () => {
    const result = await testEndpoint('/api/auth/session-fix');
    console.log('Protected endpoint test result:', result);
    alert(JSON.stringify(result, null, 2));
  };

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">Middleware & Session Test</h1>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Authentication Status</CardTitle>
          <CardDescription>
            Current authentication state as determined by Supabase client
          </CardDescription>
        </CardHeader>
        <CardContent>
          {status === 'checking' ? (
            <p>Checking authentication status...</p>
          ) : status === 'authenticated' ? (
            <div className="bg-green-100 p-3 rounded">
              <p className="font-medium text-green-800">
                Authenticated as {user?.email}
              </p>
              <p className="text-sm text-green-700 mt-2">
                User ID: {user?.id}
              </p>
            </div>
          ) : (
            <div className="bg-amber-100 p-3 rounded">
              <p className="font-medium text-amber-800">
                Not authenticated
              </p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex gap-2">
          <Button 
            onClick={() => router.push('/auth/login')}
            variant="outline"
          >
            Go to Login
          </Button>
          <Button 
            onClick={() => router.push('/dashboard')} 
            variant="default"
          >
            Test Protected Route
          </Button>
        </CardFooter>
      </Card>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Cookie Information</CardTitle>
          <CardDescription>
            Authentication cookies present in the browser
          </CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto max-h-40">
            {JSON.stringify(middlewareInfo?.cookies || {}, null, 2)}
          </pre>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={testProtectedEndpoint}
            variant="outline"
          >
            Test Auth API Endpoint
          </Button>
        </CardFooter>
      </Card>
      
      <div className="p-4 bg-blue-50 border border-blue-200 rounded">
        <h3 className="font-medium text-blue-800 mb-2">Middleware Troubleshooting</h3>
        <p className="text-blue-700 mb-2">
          If you can authenticate directly with the Login Debug Tool but still see errors in the normal login flow,
          the issue might be related to middleware or cookie handling.
        </p>
        <ul className="list-disc pl-5 text-blue-700">
          <li>Check if authentication cookies are properly set</li>
          <li>Test protected routes to see if middleware redirects as expected</li>
          <li>Compare the session state between direct API calls and middleware-processed routes</li>
        </ul>
      </div>
    </div>
  );
} 