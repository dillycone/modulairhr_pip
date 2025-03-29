'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { z } from 'zod';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';

// Form validation schema
const signupSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Password must be at least 6 characters')
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const router = useRouter();
  const { signUp, error: authError } = useAuth();

  // Handle auth configuration errors
  useEffect(() => {
    if (authError && authError.includes('configuration')) {
      setFormError('Authentication system is not properly configured. Please contact the administrator.');
    }
  }, [authError]);

  // Validate email format
  const isValidEmail = (email: string) => {
    try {
      z.string().email().parse(email);
      return true;
    } catch (error) {
      return false;
    }
  };

  // Handle form submission
  const handleSignup = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormError(null);

    try {
      // Basic validation
      if (!email || !password || !confirmPassword) {
        setFormError('Please fill in all fields');
        return;
      }

      // Validate email format
      if (!isValidEmail(email)) {
        setFormError('Please enter a valid email address');
        return;
      }

      // Validate password match
      if (password !== confirmPassword) {
        setFormError('Passwords do not match');
        return;
      }

      setIsLoading(true);

      // Check for configuration error
      if (process.env.NEXT_PUBLIC_SUPABASE_URL === 'your-supabase-url' || 
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY === 'your-supabase-anon-key') {
        throw new Error('Authentication system is not properly configured');
      }

      // Attempt to sign up with the provided credentials
      const authResponse = await signUp(email, password);

      if (!authResponse) {
        throw new Error('Registration service is unavailable');
      }

      if (authResponse.error) {
        // Handle specific error cases
        if (authResponse.error.message.includes('already registered')) {
          setFormError('This email is already registered. Please log in instead.');
        } else {
          setFormError(authResponse.error.message || 'Signup failed');
        }
        return;
      }

      // Success! Show confirmation message and redirect to login
      toast.success('Account created! Please check your email to confirm your registration.');
      router.push('/auth/login');

    } catch (error: any) {
      console.error('Signup error:', error);
      setFormError(error.message || 'An error occurred during signup');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm w-full max-w-md">
        <div className="flex flex-col space-y-1.5 p-6">
          <h3 className="font-semibold tracking-tight text-2xl text-center">Create an Account</h3>
          <p className="text-sm text-muted-foreground text-center">Enter your details to create a new account</p>
        </div>
        <div className="p-6 pt-0">
          <form onSubmit={handleSignup} className="space-y-4">
            {authError && authError.includes('configuration') ? (
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
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Password</label>
                  <input
                    id="password"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                    placeholder="••••••••"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="confirmPassword" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Confirm Password</label>
                  <input
                    id="confirmPassword"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                    placeholder="••••••••"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                {formError && (
                  <div className="text-sm text-red-500 p-2 rounded-md bg-red-50">
                    {formError}
                  </div>
                )}
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full"
                  disabled={isLoading}
                >
                  {isLoading ? 'Creating account...' : 'Sign up'}
                </button>
              </>
            )}
          </form>
        </div>
        <div className="items-center p-6 pt-0 flex justify-center">
          <div className="text-center text-sm">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-primary hover:underline">
              Log in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 