'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { LoginForm } from '@/components/auth/login-form';
import { useAuth } from '@/hooks/useAuth';
import { safeRedirect } from '@/lib/auth-navigation';
import { Skeleton } from '@/components/ui/skeleton';

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

  // This callback is for optional post-login actions (logging, analytics)
  // The actual redirect happens via the useEffect hook above
  // which detects the user state change automatically
  const handleLoginSuccess = () => { 
    console.log('Login form reported success');
    // Add any additional post-login actions here (analytics, etc.)
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
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm w-full max-w-md">
        <div className="flex flex-col space-y-1.5 p-6">
          <div className="mx-auto">
            <Skeleton className="h-8 w-32 mb-2" />
          </div>
          <Skeleton className="h-4 w-64 mx-auto" />
        </div>
        <div className="p-6 pt-0">
          <Skeleton className="h-10 w-full mb-3" />
          <Skeleton className="h-10 w-full mb-6" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
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
