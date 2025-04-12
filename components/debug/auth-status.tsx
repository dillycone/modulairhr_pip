'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function AuthDebugger() {
  const { user, loading } = useAuth();
  const [serverStatus, setServerStatus] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkServerStatus = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/auth-debug');
      const data = await response.json();
      setServerStatus(data);
    } catch (err: any) {
      setError(err.message || 'Error checking server auth status');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshSession = async () => {
    try {
      // This will reload the page and refresh auth state
      window.location.reload();
    } catch (err: any) {
      setError(err.message || 'Error refreshing session');
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto my-4">
      <CardHeader>
        <CardTitle>Auth Debugger</CardTitle>
        <CardDescription>Check your authentication status</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold">Client-Side Auth State:</h3>
            {loading ? (
              <p>Loading auth state...</p>
            ) : user ? (
              <div className="bg-slate-100 p-3 rounded-md overflow-x-auto">
                <p><strong>User ID:</strong> {user.id}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Status:</strong> Authenticated</p>
                <p><strong>App Metadata:</strong> {JSON.stringify(user.app_metadata, null, 2)}</p>
              </div>
            ) : (
              <Alert variant="destructive">
                <AlertTitle>Not Authenticated</AlertTitle>
                <AlertDescription>No user is logged in on the client side.</AlertDescription>
              </Alert>
            )}
          </div>

          {serverStatus && (
            <div>
              <h3 className="text-lg font-semibold">Server-Side Auth State:</h3>
              <div className="bg-slate-100 p-3 rounded-md overflow-x-auto">
                <pre>{JSON.stringify(serverStatus, null, 2)}</pre>
              </div>
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button onClick={checkServerStatus} disabled={isLoading}>
          {isLoading ? 'Checking...' : 'Check Server Status'}
        </Button>
        <Button onClick={refreshSession} variant="outline">
          Refresh Session
        </Button>
      </CardFooter>
    </Card>
  );
} 