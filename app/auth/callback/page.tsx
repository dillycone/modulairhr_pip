'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

function AuthCallbackContent() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('Processing authentication...');
  const [debugInfo, setDebugInfo] = useState<string | null>(null);

  useEffect(() => {
    // This function handles the OAuth callback more reliably
    async function handleAuthCallback() {
      try {
        setStatus('Processing authentication response...');
        
        // Log debug info
        const debugData = {
          url: window.location.href,
          hash: window.location.hash,
          origin: window.location.origin,
          environment: process.env.NODE_ENV,
          timestamp: new Date().toISOString()
        };
        console.log('Debug info:', debugData);
        setDebugInfo(JSON.stringify(debugData, null, 2));
        
        // Set bypass cookie to help with authentication flow
        document.cookie = `auth_bypass_token=true;path=/;max-age=${60 * 5}`; // 5 minutes
        
        // Use Supabase's built-in redirect handler which handles both hash and code flows
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Authentication error:', error);
          setError(`Authentication error: ${error.message}`);
          return;
        }
        
        if (!data.session) {
          // Try to parse the URL and create a session
          try {
            // Handle OAuth callback URL
            const { data: redirectData, error: redirectError } = await supabase.auth.exchangeCodeForSession(
              window.location.href
            );
            
            if (redirectError) {
              console.error('Failed to get session from URL:', redirectError);
              setError(`Failed to authenticate: ${redirectError.message}`);
              return;
            }
            
            if (!redirectData.session) {
              setError('No session was created. Please try again.');
              return;
            }
            
            console.log('Successfully authenticated from redirect');
          } catch (exchangeError: any) {
            console.error('Error exchanging code:', exchangeError);
            setError(`Authentication error: ${exchangeError.message}`);
            return;
          }
        } else {
          console.log('Session already exists');
        }
        
        // Give a moment for session to fully establish
        setStatus('Authentication successful, establishing session...');
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Redirect to dashboard
        console.log('Redirecting to dashboard...');
        window.location.href = '/dashboard';
        
      } catch (err: any) {
        console.error('Auth callback error:', err);
        setError(`Authentication failed: ${err.message || 'Unknown error'}`);
        setStatus('Authentication failed');
      }
    }

    handleAuthCallback();
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="mx-auto w-full max-w-md space-y-6 px-4">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">Processing your sign-in</h1>
          <p className="text-gray-500">{status}</p>
        </div>
        
        {error ? (
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex flex-col">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Authentication failed</h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{error}</p>
                  </div>
                  <div className="mt-4">
                    <button
                      type="button"
                      className="inline-flex items-center rounded-md border border-transparent bg-red-200 px-3 py-2 text-sm font-medium leading-4 text-red-800 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                      onClick={() => router.push('/auth/login')}
                    >
                      Return to login
                    </button>
                  </div>
                </div>
              </div>
              
              {debugInfo && (
                <div className="mt-4 p-3 bg-gray-50 rounded text-xs font-mono overflow-auto max-h-64">
                  <details>
                    <summary className="cursor-pointer text-gray-500">Debug Information</summary>
                    <pre className="mt-2 whitespace-pre-wrap break-all">{debugInfo}</pre>
                  </details>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            <p className="text-sm text-gray-500">This may take a few moments...</p>
            
            {debugInfo && (
              <div className="mt-4 p-3 bg-gray-50 rounded text-xs font-mono overflow-auto max-h-64 w-full">
                <details>
                  <summary className="cursor-pointer text-gray-500">Debug Information</summary>
                  <pre className="mt-2 whitespace-pre-wrap break-all">{debugInfo}</pre>
                </details>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  );
} 