'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { SignUpForm } from '@/components/auth/signup-form';
import { Suspense } from 'react';
import { safeRedirect } from '@/lib/auth-navigation';

function SignupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get('redirect');
  const validRedirectPath = safeRedirect(redirectParam);

  const handleSignUpSuccess = (email: string) => {
    // After signup, redirect to check-email page with the email and redirect parameters
    router.push(`/auth/check-email?email=${encodeURIComponent(email)}&redirect=${encodeURIComponent(validRedirectPath)}`);
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Create an Account</CardTitle>
          <CardDescription className="text-center">
            Enter your details to create a new account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SignUpForm onSignUpSuccess={handleSignUpSuccess} />
        </CardContent>
        <CardFooter className="flex justify-center">
          <div className="text-center text-sm">
            Already have an account?{' '}
            <Link 
              href={`/auth/login?redirect=${encodeURIComponent(validRedirectPath)}`} 
              className="text-primary hover:underline"
            >
              Log in
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading...</div>}>
      <SignupContent />
    </Suspense>
  );
} 