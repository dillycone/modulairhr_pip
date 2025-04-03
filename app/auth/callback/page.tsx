'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

function AuthCallbackContent() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('Processing authentication...');

  useEffect(() => {
    async function handleAuthCallback() {
      try {
        setStatus('Processing authentication response...');

        try { localStorage.removeItem('auth_redirect_attempt'); } catch(_) {}

        const urlParams = new URLSearchParams(window.location.search);
        const hasCode = urlParams.has('code');
        if (hasCode) {
          try {
            await supabase.auth.signOut({ scope: 'local' });
            await new Promise(resolve => setTimeout(resolve, 500));
            const { data: exchangeData, error: exchangeError } = await supabase.auth.exchangeCodeForSession(window.location.href);
            
            if (exchangeError) {
              setError(`Authentication error: ${exchangeError.message}`);
              return;
            }
            
            if (!exchangeData.session) {
              setError('No session was created. Please try again.');
              return;
            }
            
            router.push('/dashboard');
            return;
          } catch (ex: any) {
            setError(`Authentication error: ${ex.message}`);
            return;
          }
        }

        // Check for existing session
        const { data, error: sessionErr } = await supabase.auth.getSession();
        if (sessionErr || !data.session) {
          setError('No auth session found. Please log in again.');
        }
      } catch (err: any) {
        console.error('Auth callback error:', err);
        setError(`Authentication failed: ${err.message || 'Unknown error'}`);
      }
    }

    handleAuthCallback();
  }, [router]);

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
