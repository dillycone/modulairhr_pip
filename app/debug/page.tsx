'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function DebugIndexPage() {
  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Authentication Diagnostics</h1>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Link href="/debug/auth-debug" className="block">
          <Card className="h-full transition-shadow hover:shadow-md">
            <CardHeader>
              <CardTitle>Auth State Debugger</CardTitle>
              <CardDescription>
                Inspect local storage auth state and test Supabase connection
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>
                View client-side authentication data including rate limiting state, 
                clear stored data, and test your connection to Supabase.
              </p>
            </CardContent>
          </Card>
        </Link>
        
        <Link href="/debug/login-debug" className="block">
          <Card className="h-full transition-shadow hover:shadow-md">
            <CardHeader>
              <CardTitle>Login API Tester</CardTitle>
              <CardDescription>
                Test raw authentication API calls to Supabase
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>
                Make direct calls to the Supabase authentication API and see the
                complete raw response to diagnose login issues.
              </p>
            </CardContent>
          </Card>
        </Link>
        
        <Link href="/debug/middleware-test" className="block">
          <Card className="h-full transition-shadow hover:shadow-md">
            <CardHeader>
              <CardTitle>Middleware Test</CardTitle>
              <CardDescription>
                Test middleware and session handling
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>
                Check if authentication cookies are being properly set and if 
                middleware is correctly handling authentication state.
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>
      
      <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
        <h2 className="text-lg font-medium text-yellow-800 mb-2">Debugging Instructions</h2>
        <ol className="list-decimal pl-5 space-y-2 text-yellow-800">
          <li>
            First use the <strong>Auth State Debugger</strong> to clear any rate limiting data stored
            in your browser.
          </li>
          <li>
            Try the <strong>Login API Tester</strong> to make a direct authentication call to Supabase
            and examine the raw response.
          </li>
          <li>
            If the direct API call works but the normal login still fails, use the <strong>Middleware Test</strong>
            tool to check if middleware or cookie handling might be the issue.
          </li>
        </ol>
      </div>
    </div>
  );
} 