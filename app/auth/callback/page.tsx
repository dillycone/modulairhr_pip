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
        
        // Log enhanced debug info 
        const debugData = {
          url: window.location.href,
          hash: window.location.hash,
          search: window.location.search,
          host: window.location.host,
          hostname: window.location.hostname,
          origin: window.location.origin,
          environment: process.env.NODE_ENV,
          timestamp: new Date().toISOString(),
          // Cookie info (without revealing values)
          cookieNames: document.cookie.split(';').map(c => c.trim().split('=')[0]),
          userAgent: navigator.userAgent
        };
        console.log('Auth callback debug info:', debugData);
        setDebugInfo(JSON.stringify(debugData, null, 2));
        
        // Set bypass cookie to help with authentication flow
        document.cookie = `auth_bypass_token=true;path=/;max-age=${60 * 5};SameSite=Lax`; // 5 minutes
        
        // SIMPLIFIED AUTH FLOW: FOCUS ON HASH FRAGMENT HANDLING
        // ------------------------------------------------------
        // Per diagnosis, we're receiving tokens in the hash, so prioritize that flow
        if (window.location.hash) {
          const hashParams = new URLSearchParams(window.location.hash.substring(1));
          const accessToken = hashParams.get('access_token');
          const refreshToken = hashParams.get('refresh_token');
          
          if (accessToken && refreshToken) {
            console.log('Found access & refresh tokens in URL hash');
            
            try {
              setStatus('Setting up your session...');
              console.log('Attempting supabase.auth.setSession...');

              // Use Supabase's recommended method for setting session
              try {
                setStatus('Setting up your session...');
                console.log('Attempting to establish session from URL hash tokens...');
                
                // First try using the recommended method that preserves cookie state
                const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
                  access_token: accessToken,
                  refresh_token: refreshToken
                });

                if (sessionError) {
                  console.error('Failed to set session from hash:', sessionError);
                  setError(`Authentication error during setSession: ${sessionError.message}`);
                  return;
                }

                if (!sessionData.session) {
                  console.error('setSession succeeded but returned no session.');
                  setError('No session was created after authentication. Please try again.');
                  return;
                }

                console.log('Successfully set session from hash tokens. Session User:', sessionData.user?.email);
                
                // Verify the session was properly established with a getSession check
                const { data: verifyData, error: verifyError } = await supabase.auth.getSession();
                if (verifyError) {
                  console.error('Error verifying session after setSession:', verifyError);
                  // Continue with redirect anyway
                } else {
                  console.log('Session verification:', verifyData.session ? 'Session exists' : 'No session found');
                }

                // Set a short delay to allow session to be fully established
                setStatus('Authentication successful, redirecting to dashboard...');
                await new Promise(resolve => setTimeout(resolve, 1500));

                // Use router.push instead of direct location change to ensure proper state handling
                let dashboardUrl = '/dashboard';
                console.log(`Redirecting to ${dashboardUrl}`);
                router.push(dashboardUrl);
              } catch (setSessionError: any) {
                console.error('Critical error during session establishment:', setSessionError);
                setError(`Authentication error: ${setSessionError.message || 'Failed to establish session'}`);
                return;
              }
              return;
            } catch (sessionError: any) {
              console.error('Critical error during supabase.auth.setSession call:', sessionError);
              setError(`Authentication error: ${sessionError.message || 'Failed to establish session'}`);
              return;
            }
          } else {
            console.warn('Hash fragment present but missing required tokens');
          }
        }
        
        // FALLBACK: CHECK FOR CODE PARAMETER OR EXISTING SESSION
        // ------------------------------------------------------
        // This is a fallback for other authentication flows
        const urlParams = new URLSearchParams(window.location.search);
        const hasCode = urlParams.has('code');
        
        if (hasCode) {
          console.log('Found code parameter in URL, attempting to exchange for session');
          
          try {
            const { data: exchangeData, error: exchangeError } = await supabase.auth.exchangeCodeForSession(
              window.location.href
            );
            
            if (exchangeError) {
              console.error('Failed to exchange code for session:', exchangeError);
              setError(`Authentication error: ${exchangeError.message}`);
              return;
            }
            
            if (!exchangeData.session) {
              setError('No session was created from code exchange. Please try again.');
              return;
            }
            
            console.log('Successfully authenticated with code exchange');
            
            // Short delay to allow session to establish
            setStatus('Authentication successful, redirecting to dashboard...');
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Redirect to dashboard
            window.location.href = '/dashboard';
            return;
          } catch (exchangeError: any) {
            console.error('Error exchanging code:', exchangeError);
            setError(`Authentication error: ${exchangeError.message || 'Failed to process authentication code'}`);
            return;
          }
        }
        
        // As a final fallback, check if we already have a session
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Error getting session:', sessionError);
          setError(`Authentication error: ${sessionError.message}`);
          return;
        }
        
        if (sessionData.session) {
          console.log('Found existing session, redirecting to dashboard');
          setStatus('Authentication successful, redirecting to dashboard...');
          window.location.href = '/dashboard';
          return;
        }
        
        // If we get here, we have no auth data to work with
        setError('No authentication data found. Please try again or contact support.');
        
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