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
    // Delay navigation to show success message
    setTimeout(() => router.push('/auth/login'), 2000);
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Reset Password</CardTitle>
          <CardDescription className="text-center">
            {isSuccess 
              ? "Password reset email sent! Redirecting to login..." 
              : "Enter your email to receive a password reset link"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!isSuccess && <PasswordForm mode="reset" onSuccess={handleSuccess} />}
          {isSuccess && (
            <div className="py-4 text-center text-green-600">
              Check your email for the password reset link.
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
