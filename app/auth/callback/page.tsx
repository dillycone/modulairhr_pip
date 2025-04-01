'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('Processing authentication...');
  const [debugInfo, setDebugInfo] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log('Auth callback initiated');
        setStatus('Starting authentication process...');
        
        // Collect debugging information about the current URL
        const currentUrl = window.location.href;
        const searchParamsEntries = Array.from(searchParams.entries());
        const allSearchParams = Object.fromEntries(searchParamsEntries);
        
        const debugData = {
          url: currentUrl,
          hash: window.location.hash,
          params: allSearchParams,
          hostname: window.location.hostname,
          origin: window.location.origin,
          environment: process.env.NODE_ENV,
          timestamp: new Date().toISOString()
        };
        
        console.log('Debug info:', debugData);
        setDebugInfo(JSON.stringify(debugData, null, 2));
        
        // Get the URL hash from the window object (more reliable than using searchParams)
        const hash = window.location.hash;
        const code = searchParams.get('code');
        const error = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');
        
        // Check if we received an error from the OAuth provider
        if (error) {
          console.error('OAuth provider returned an error:', { error, errorDescription });
          setError(`Authentication error: ${errorDescription || error}`);
          return;
        }
        
        console.log('Auth data:', { hasHash: !!hash, hasCode: !!code });
        
        try {
          // Set a bypass token in cookies to help middleware identify this as a valid OAuth session
          document.cookie = `auth_bypass_token=true;path=/;max-age=${60 * 5}`; // 5 minutes
        } catch (cookieError) {
          console.warn('Failed to set auth bypass cookie:', cookieError);
          // Continue even if cookie setting fails
        }
        
        // Special handling for the case when we don't have hash or code
        if (!hash && !code) {
          console.error('Missing both hash and code parameters in the callback');
          
          // Try to get the session directly - might work if the user is already authenticated
          try {
            const { data: sessionData } = await supabase.auth.getSession();
            if (sessionData.session) {
              console.log('Found existing session, redirecting to dashboard');
              window.location.href = '/dashboard';
              return;
            }
          } catch (existingSessionError) {
            console.error('Error checking for existing session:', existingSessionError);
          }
          
          setError('Authentication failed: No authentication data received from provider. Please try again.');
          return;
        }
        
        // If we have a hash, the user was redirected from OAuth
        if (hash) {
          setStatus('Processing OAuth callback with hash...');
          console.log('Processing hash authentication, hash length:', hash.length);
          
          try {
            // First, attempt to manually process the hash fragment if it contains an access_token
            if (hash.includes('access_token')) {
              console.log('Hash contains access_token, attempting manual processing');
              
              try {
                // Let supabase auth library handle the hash fragment
                const { data, error } = await supabase.auth.getSession();
                
                if (error) {
                  console.error('Error getting session from hash:', error);
                  throw error;
                }
                
                if (data.session) {
                  console.log('Session obtained successfully from hash');
                  setStatus('Authentication successful, validating...');
                  
                  // Make a second verification call to ensure session is stored
                  try {
                    const { data: verifyData, error: verifyError } = await supabase.auth.getUser();
                    
                    if (verifyError) {
                      console.error('Error verifying user after OAuth:', verifyError);
                      // Don't throw here, continue with redirect even if verification fails
                    } else {
                      console.log('User verified:', !!verifyData.user);
                    }
                  } catch (verifyException) {
                    console.error('Exception during user verification:', verifyException);
                    // Continue despite verification exception
                  }
                  
                  setStatus('Authentication successful, establishing session...');
                  
                  // Add a longer delay to allow session to be properly established and propagated
                  await new Promise(resolve => setTimeout(resolve, 1500));
                  
                  // Use window.location for a hard redirect instead of router.push
                  console.log('Using hard redirect to dashboard');
                  window.location.href = '/dashboard';
                  return;
                } else {
                  console.warn('No session found after hash processing, falling back to code method');
                }
              } catch (hashProcessingError) {
                console.error('Error processing hash fragment:', hashProcessingError);
                // Fall through to code-based auth if hash processing fails
              }
            }
          } catch (hashError) {
            console.error('Error in hash-based authentication:', hashError);
            // Fall through to code-based auth if hash auth fails
          }
        }
        
        // If we have a code, try to handle that
        if (code) {
          setStatus('Processing authentication code...');
          console.log('Processing code authentication');
          
          try {
            // Try to exchange the code for a session
            const { data, error: sessionError } = await supabase.auth.exchangeCodeForSession(code);
            
            if (sessionError) {
              console.error('Error exchanging code for session:', sessionError);
              throw sessionError;
            }
            
            console.log('Code exchange successful, session obtained:', !!data.session);
            setStatus('Authentication successful, validating...');
            
            // Make a second verification call to ensure session is stored
            try {
              const { data: verifyData, error: verifyError } = await supabase.auth.getUser();
              
              if (verifyError) {
                console.error('Error verifying user after code exchange:', verifyError);
                // Don't throw here, continue with redirect even if verification fails
              } else {
                console.log('User verified:', !!verifyData.user);
              }
            } catch (verifyException) {
              console.error('Exception during user verification:', verifyException);
              // Continue despite verification exception
            }
            
            setStatus('Authentication successful, establishing session...');
            
            // Add a longer delay to allow session to be properly established
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Use window.location for a hard redirect instead of setTimeout/router.push
            console.log('Using hard redirect to dashboard');
            window.location.href = '/dashboard';
          } catch (codeError: any) {
            console.error('Error in code-based authentication:', codeError);
            setError('Failed to authenticate with code: ' + (codeError.message || 'Unknown error'));
          }
          return;
        }
        
        // We should never reach here, but just in case
        setError('Authentication failed: Unable to process authentication response');
        
      } catch (err: any) {
        console.error('Auth callback error:', err);
        setError(err.message || 'Authentication failed');
        setStatus('Authentication failed');
      }
    };
    
    handleCallback();
  }, [router, searchParams]);

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
                  <details open>
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