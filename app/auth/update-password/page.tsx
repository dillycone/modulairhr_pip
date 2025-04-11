"use client";

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PasswordForm } from "@/components/auth/password-form";

export default function UpdatePasswordPage() {
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
          <CardTitle className="text-2xl text-center">Update Password</CardTitle>
          <CardDescription className="text-center">
            {isSuccess 
              ? "Password updated successfully! Redirecting to login..." 
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
