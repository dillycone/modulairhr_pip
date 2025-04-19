'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { LoginForm } from '@/components/auth/login-form';
import { useAuth } from '@/hooks/useAuth';
import { safeRedirect } from '@/lib/auth-navigation';
import { Loader } from '@/components/ui';

/**
 * Login page component
 * - Handles redirection to dashboard when user is already authenticated
 * - Shows login form when user is not authenticated
 */
function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get('redirect');
  const validRedirectPath = safeRedirect(redirectParam);
  
  const { user, loading, isInitialized } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (isInitialized && user && !loading) {
      router.push(validRedirectPath);
    }
  }, [user, loading, router, validRedirectPath, isInitialized]);

  // This callback is for optional post-login actions (logging, analytics)
  const handleLoginSuccess = () => {
    // User will be redirected by the useEffect hook above
    // Additional login success actions can be added here
  };

  // Show loader until auth state is initialized
  if (!isInitialized) {
    return <div className="flex h-screen items-center justify-center"><Loader variant="form" /></div>;
  }

  // If user is authenticated already, show a loading spinner until redirection happens
  if (user) {
    return <div className="flex h-screen items-center justify-center"><Loader variant="form" /></div>;
  }

  // Show login form
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

export default function Login() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center"><Loader variant="form" /></div>}>
      <LoginPage />
    </Suspense>
  );
}