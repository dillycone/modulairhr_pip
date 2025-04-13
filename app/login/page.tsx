'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader } from '@/components/ui';

function clearRateLimitData() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('loginAttempts');
    localStorage.removeItem('cooldownEnd');
    localStorage.removeItem('lastAttemptTime');
    console.log('Login rate limit data cleared');
  }
}

function LoginRedirectContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || null;
  
  useEffect(() => {
    // Clear any stored rate limit data
    clearRateLimitData();
    
    // Redirect to the auth/login page, preserving any redirect parameter
    const targetPath = redirectTo 
      ? `/auth/login?redirect=${encodeURIComponent(redirectTo)}`
      : '/auth/login';
    
    router.push(targetPath);
  }, [router, redirectTo]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="text-center">
        <h2 className="text-lg font-medium">Redirecting to login...</h2>
        <p className="text-sm text-gray-500">Please wait</p>
      </div>
    </div>
  );
}

export default function LoginRedirect() {
  return (
    <Suspense fallback={<Loader variant="simple" message="Loading..." />}>
      <LoginRedirectContent />
    </Suspense>
  );
}