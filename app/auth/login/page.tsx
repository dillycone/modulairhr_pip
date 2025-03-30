'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/hooks/useAuth';
import { AuthError } from '@/components/ui/auth-error';
import { SocialLoginButtons } from '@/components/auth/social-login-buttons';

// Form validation schema
const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().default(false),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const [redirectTo, setRedirectTo] = useState('/dashboard');
  const router = useRouter();
  const { signIn, signInWithOAuth, error: authError } = useAuth();
  
  // Initialize form with react-hook-form
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  // Safely get search params
  useEffect(() => {
    try {
      const searchParams = new URLSearchParams(window.location.search);
      const redirect = searchParams.get('redirect');
      if (redirect) {
        setRedirectTo(redirect);
      }
    } catch (error) {
      console.error('Error parsing search params:', error);
    }
  }, []);

  // Handle form submission
  const onSubmit = async (values: LoginFormValues) => {
    setIsLoading(true);

    try {
      // Attempt to sign in with the provided credentials
      const authResponse = await signIn({
        email: values.email,
        password: values.password,
        rememberMe: values.rememberMe
      });

      if (!authResponse) {
        throw new Error('Authentication service is unavailable');
      }

      if (authResponse.error) {
        // Form error will be displayed through the auth hook's error state
        setIsLoading(false);
        return;
      }

      // Success! Redirect to the dashboard or specified path
      router.push(redirectTo);
    } catch (error: any) {
      console.error('Login error:', error);
      setIsLoading(false);
    }
  };

  // Handle social login
  const handleSocialLogin = async (provider: 'google' | 'github') => {
    setIsLoading(true);
    
    try {
      // Initiate OAuth flow with the selected provider
      await signInWithOAuth(provider);
      
      // The user will be redirected to the provider's authentication page
    } catch (error) {
      console.error(`Error during ${provider} login:`, error);
      setIsLoading(false);
    }
  };

  // Show or hide configuration error
  const showConfigError = authError?.code === 'auth/missing-oauth-credentials' || 
                          (authError?.message && authError.message.includes('configuration'));

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm w-full max-w-md">
        <div className="flex flex-col space-y-1.5 p-6">
          <h3 className="font-semibold tracking-tight text-2xl text-center">Log in</h3>
          <p className="text-sm text-muted-foreground text-center">Enter your credentials to access your account</p>
        </div>
        <div className="p-6 pt-0">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {showConfigError ? (
              <div className="rounded-md bg-yellow-50 p-4 mb-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">Configuration Error</h3>
                    <div className="mt-2 text-sm text-yellow-700">
                      <p>The authentication system is not properly configured. This is a development environment issue.</p>
                      <p className="mt-1 font-medium">Steps to fix:</p>
                      <ol className="list-decimal pl-5 mt-1 space-y-1">
                        <li>Update your .env.local file with your Supabase credentials</li>
                        <li>Restart the development server</li>
                      </ol>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Email</label>
                  <input
                    id="email"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                    placeholder="you@example.com"
                    type="email"
                    {...form.register('email')}
                    disabled={isLoading}
                  />
                  {form.formState.errors.email && (
                    <p className="text-sm text-red-500">{form.formState.errors.email.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label htmlFor="password" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Password</label>
                    <Link href="/auth/reset-password" className="text-xs text-primary hover:underline">Forgot password?</Link>
                  </div>
                  <input
                    id="password"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                    placeholder="••••••••"
                    type="password"
                    {...form.register('password')}
                    disabled={isLoading}
                  />
                  {form.formState.errors.password && (
                    <p className="text-sm text-red-500">{form.formState.errors.password.message}</p>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="rememberMe"
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    {...form.register('rememberMe')}
                    disabled={isLoading}
                  />
                  <label htmlFor="rememberMe" className="text-sm text-gray-700">
                    Keep me signed in
                  </label>
                </div>
                {authError && !showConfigError && (
                  <AuthError
                    severity="error"
                    message={authError.message}
                  />
                )}
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full"
                  disabled={isLoading}
                >
                  {isLoading ? 'Logging in...' : 'Log in'}
                </button>
                
                {/* Social Login Buttons */}
                <SocialLoginButtons 
                  onSocialLogin={handleSocialLogin}
                  isLoading={isLoading}
                />
              </>
            )}
          </form>
        </div>
        <div className="items-center p-6 pt-0 flex justify-center">
          <div className="text-center text-sm">
            Don&apos;t have an account?{' '}
            <Link href="/auth/signup" className="text-primary hover:underline">
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 