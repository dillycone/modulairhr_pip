'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { safeRedirect } from '@/lib/auth-navigation';

// Map common auth errors to user-friendly messages
const mapAuthError = (errorCode: string, errorMessage: string): { code: string, message: string } => {
  const defaultMessage = 'Authentication failed. Please try again.';
  
  const errorMap: Record<string, string> = {
    'no_code': 'Invalid authentication request. Please try logging in again.',
    'exchange_error': (errorMessage.includes('expired') || errorMessage.includes('timeout')) 
      ? 'Your authentication link has expired. Please request a new one.' 
      : 'Failed to complete authentication. Please try again.',
    'session_error': 'Unable to establish a secure session. Please try again.',
  };

  return {
    code: errorCode,
    message: errorMap[errorCode] || defaultMessage
  };
};

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('Processing authentication...');

  useEffect(() => {
    async function handleAuthCallback() {
      try {
        setStatus('Processing authentication response...');

        const code = searchParams.get('code');
        const redirectUrl = searchParams.get('redirect');
        const safeRedirectTo = safeRedirect(redirectUrl);
        
        if (!code) {
          const { message } = mapAuthError('no_code', '');
          setError(message);
          router.push(`/auth/login?error=no_code&message=${encodeURIComponent(message)}`);
          return;
        }
        
        // Exchange the code for a session (stores in cookie)
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          
        if (exchangeError) {
          console.error('Exchange error:', exchangeError);
          const { code: errorCode, message } = mapAuthError('exchange_error', exchangeError.message);
          setError(message);
          router.push(`/auth/login?error=${errorCode}&message=${encodeURIComponent(message)}`);
          return;
        }
        
        // Check session to confirm it worked
        const { data, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !data.session) {
          console.error('Session error:', sessionError);
          const errorMessage = sessionError?.message || 'Failed to establish session';
          const { code: errorCode, message } = mapAuthError('session_error', errorMessage);
          setError(message);
          router.push(`/auth/login?error=${errorCode}&message=${encodeURIComponent(message)}`);
          return;
        }
        
        // Success - redirect to dashboard or the specified redirect path
        setStatus(`Authentication successful, redirecting to ${safeRedirectTo}...`);
        
        // Allow time for auth state to propagate via onAuthStateChange events
        setTimeout(() => {
          router.push(safeRedirectTo);
        }, 300);
      } catch (err: any) {
        console.error('Auth callback error:', err);
        const errorMessage = err.message || 'Unknown error';
        const { code: errorCode, message } = mapAuthError('callback_error', errorMessage);
        setError(message);
        router.push(`/auth/login?error=${errorCode}&message=${encodeURIComponent(message)}`);
      }
    }

    handleAuthCallback();
  }, [router, searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      {error
        ? <div className="text-red-600">{error}</div>
        : <div>{status}</div>}
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><div>Loading...</div></div>}>
      <AuthCallbackContent />
    </Suspense>
  );
}
