'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { LoginForm } from '@/components/auth/login-form';
import { useAuth } from '@/hooks/useAuth';
import { safeRedirect } from '@/lib/auth-navigation';

function LoginFormWrapper() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get('redirect');
  const validRedirectPath = safeRedirect(redirectParam);
  const { user, loading } = useAuth();

  useEffect(() => {
    if (user && !loading) {
      router.push(validRedirectPath);
    }
  }, [user, loading, router, validRedirectPath]);

  const handleLoginSuccess = () => { 
    // Success is handled by useEffect watching for user state change
    console.log('Login form reported success');
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm w-full max-w-md">
        <div className="flex flex-col space-y-1.5 p-6">
          <h3 className="font-semibold tracking-tight text-2xl text-center">Log in</h3>
          <p className="text-sm text-muted-foreground text-center">Enter your credentials to access your account</p>
        </div>
        <div className="p-6 pt-0">
          <LoginForm 
            onLoginSuccess={handleLoginSuccess}
            initialRedirectTo={validRedirectPath}
          />
        </div>
      </div>
    </div>
  );
}

function LoginLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div>Loading...</div>
    </div>
  );
}

export default function Login() {
  return (
    <Suspense fallback={<LoginLoading />}>
      <LoginFormWrapper />
    </Suspense>
  );
}
