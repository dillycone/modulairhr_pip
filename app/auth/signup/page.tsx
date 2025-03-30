'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { SignUpForm } from '@/components/auth/signup-form';

export default function SignupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/dashboard';

  const handleSignUpSuccess = () => {
    // After signup, redirect to login with the same redirect parameter
    const loginUrl = new URL('/auth/login', window.location.origin);
    loginUrl.searchParams.set('redirect', redirectTo);
    router.push(loginUrl.toString());
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
              href={`/auth/login${redirectTo !== '/dashboard' ? `?redirect=${encodeURIComponent(redirectTo)}` : ''}`} 
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