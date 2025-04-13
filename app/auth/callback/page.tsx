'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { safeRedirect } from '@/lib/auth-navigation';
import { useAuth } from '@/hooks/useAuth';
import { Loader } from '@/components/ui';
import { mapAuthError, formatErrorForUrl } from '@/lib/error-helpers';

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('Processing authentication...');
  const { onAuthStateReady } = useAuth();

  useEffect(() => {
    async function handleAuthCallback() {
      try {
        setStatus('Processing authentication response...');

        const code = searchParams.get('code');
        const redirectUrl = searchParams.get('redirect');
        const safeRedirectTo = safeRedirect(redirectUrl);
        
        if (!code) {
          const authError = mapAuthError('no_code', '');
          setError(authError.message);
          router.push(`/auth/login?${formatErrorForUrl(authError)}`);
          return;
        }
        
        // Exchange the code for a session (stores in cookie)
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          
        if (exchangeError) {
          console.error('Exchange error:', exchangeError);
          const authError = mapAuthError('exchange_error', exchangeError.message);
          setError(authError.message);
          router.push(`/auth/login?${formatErrorForUrl(authError)}`);
          return;
        }
        
        // Check session to confirm it worked
        const { data, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !data.session) {
          console.error('Session error:', sessionError);
          const errorMessage = sessionError?.message || 'Failed to establish session';
          const authError = mapAuthError('session_error', errorMessage);
          setError(authError.message);
          router.push(`/auth/login?${formatErrorForUrl(authError)}`);
          return;
        }
        
        // Success - redirect to dashboard or the specified redirect path
        setStatus(`Authentication successful, redirecting to ${safeRedirectTo}...`);
        
        // Wait for auth state to be ready before redirecting
        onAuthStateReady(() => {
          router.push(safeRedirectTo);
        });
      } catch (err: any) {
        console.error('Auth callback error:', err);
        const errorMessage = err.message || 'Unknown error';
        const authError = mapAuthError('callback_error', errorMessage);
        setError(authError.message);
        router.push(`/auth/login?${formatErrorForUrl(authError)}`);
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
    <Suspense fallback={<Loader variant="simple" />}>
      <AuthCallbackContent />
    </Suspense>
  );
}
