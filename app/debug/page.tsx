"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AuthDebugger from '@/components/debug/auth-status';
import SessionRefreshButton from '@/components/auth/session-refresh';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { isDebugEnabled } from '@/lib/env';

export default function DebugPage() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to home page if not in development mode
    if (!isDebugEnabled()) {
      router.push('/');
    }
  }, [router]);

  // Only render content if in development mode
  if (typeof window !== 'undefined' && !isDebugEnabled()) {
    return null;
  }
  
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Auth Debug Page</h1>
      <p className="mb-6">Use this page to debug authentication and permissions issues.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Session Troubleshooting</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              If you're seeing "Unauthorized" errors in your application, your server-side session might be missing or invalid. Use the button below to fix your session.
            </p>
            <div className="max-w-xs">
              <SessionRefreshButton />
            </div>
          </CardContent>
        </Card>
      </div>
      
      <AuthDebugger />
    </div>
  );
} 