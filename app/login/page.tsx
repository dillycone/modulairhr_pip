'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function LoginRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || null;
  
  useEffect(() => {
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