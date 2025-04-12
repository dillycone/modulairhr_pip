"use client";

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PasswordForm } from "@/components/auth/password-form";
import { useAuth } from "@/hooks/useAuth";

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [isSuccess, setIsSuccess] = useState(false);
  const [redirectTimer, setRedirectTimer] = useState(3);
  const { session } = useAuth();
  
  // Token validation is now handled in the password-form component
  // which properly validates the token when attempting to update the password
  
  const handleSuccess = () => {
    setIsSuccess(true);
    
    // Use interval for countdown timer
    const interval = setInterval(() => {
      setRedirectTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          router.push('/auth/login');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    // Cleanup on unmount
    return () => clearInterval(interval);
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Update Password</CardTitle>
          <CardDescription className="text-center">
            {isSuccess 
              ? `Password updated successfully! Redirecting to login in ${redirectTimer}...` 
              : "Enter your new password"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!isSuccess && <PasswordForm mode="update" onSuccess={handleSuccess} />}
          {isSuccess && (
            <div className="py-4 text-center text-green-600">
              Your password has been updated successfully.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
