'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { LoginForm } from '@/components/auth/login-form';
import { useAuth } from '@/hooks/useAuth';

// Main login form wrapper that handles routing
function LoginFormWrapper() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/dashboard';
  const { user, loading } = useAuth();

  useEffect(() => {
    // Check for auth bypass cookie
    const checkAuthBypass = () => {
      const cookies = document.cookie.split(';');
      const bypassCookie = cookies.find(cookie => cookie.trim().startsWith('auth_bypass_token='));
      return !!bypassCookie;
    };
    
    const hasAuthBypass = checkAuthBypass();
    
    // If user is already logged in or has bypass, redirect to dashboard
    if ((user && !loading) || hasAuthBypass) {
      console.log('User already logged in or has bypass cookie, redirecting to dashboard', {
        hasUser: !!user,
        hasAuthBypass
      });
      router.push(redirectTo);
    }
  }, [user, loading, router, redirectTo]);

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
        <div className="text-center text-xs text-gray-500 pb-4">
          <button 
            onClick={() => {
              document.cookie = "auth_bypass_token=dev_bypass_token; path=/; max-age=86400";
              router.push('/dashboard');
            }}
            className="text-gray-400 hover:text-gray-600"
          >
            Developer Mode
          </button>
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