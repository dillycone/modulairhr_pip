"use client";

import { useRouter } from 'next/navigation';
import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { PasswordForm } from "@/components/auth/password-form";
import { useState } from 'react';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [isSuccess, setIsSuccess] = useState(false);
  
  const handleSuccess = () => {
    setIsSuccess(true);
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Reset Password</CardTitle>
          <CardDescription className="text-center">
            {isSuccess 
              ? "Password reset email sent!" 
              : "Enter your email to receive a password reset link"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!isSuccess && <PasswordForm mode="reset" onSuccess={handleSuccess} />}
          {isSuccess && (
            <div className="py-4 text-center">
              <div className="text-green-600 mb-4">
                Check your email for the password reset link.
              </div>
              <button 
                onClick={() => router.push('/auth/login')}
                className="w-full py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md"
              >
                Back to Login
              </button>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
          <div className="text-center text-sm">
            <Link href="/auth/login" className="text-primary hover:underline">
              Back to login
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
