'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';

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
        const redirectTo = searchParams.get('redirect') || '/dashboard';
        
        if (code) {
          // Exchange the code for a session (stores in cookie)
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
            
          if (exchangeError) {
            setStatus('Authentication error, redirecting to login...');
            console.error('Exchange error:', exchangeError);
            setTimeout(() => {
              router.push('/auth/login');
            }, 2000);
            return;
          }
          
          // Check session to confirm it worked
          const { data, error: sessionError } = await supabase.auth.getSession();
          
          if (sessionError || !data.session) {
            setStatus('Session error, redirecting to login...');
            console.error('Session error:', sessionError);
            setTimeout(() => {
              router.push('/auth/login');
            }, 2000);
            return;
          }
          
          // Success - redirect to dashboard or the specified redirect path
          setStatus(`Authentication successful, redirecting to ${redirectTo}...`);
          router.push(redirectTo);
          return;
        } else {
          setStatus('No authentication code found, redirecting to login...');
          setTimeout(() => {
            router.push('/auth/login');
          }, 2000);
        }
      } catch (err: any) {
        console.error('Auth callback error:', err);
        setError(`Authentication failed: ${err.message || 'Unknown error'}`);
        setTimeout(() => {
          router.push('/auth/login');
        }, 3000);
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
