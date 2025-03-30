'use client';

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { LoginForm } from '@/components/auth/login-form';

// Main login form wrapper that handles routing
function LoginFormWrapper() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/dashboard';

  const handleLoginSuccess = () => {
    router.push(redirectTo);
  };

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
            initialRedirectTo={redirectTo}
          />
        </div>
        <div className="items-center p-6 pt-0 flex justify-center">
          <div className="text-center text-sm">
            Don&apos;t have an account?{' '}
            <a href="/auth/signup" className="text-primary hover:underline">
              Sign up
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

// Loading fallback
function LoginLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="mt-2">Loading...</p>
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