"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { safeRedirect } from "@/lib/auth-navigation";

function CheckEmailPageContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const redirectPath = searchParams.get("redirect");
  const validRedirectPath = safeRedirect(redirectPath);

  return (
    <div className="container flex h-screen w-full flex-col items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold">Check your email</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <p className="text-lg">
            We&apos;ve sent a verification link to:
          </p>
          <p className="font-medium text-primary">
            {email || "your email address"}
          </p>
          <p className="text-sm text-muted-foreground mt-4">
            Please check your inbox and click on the verification link to complete your registration.
            If you don&apos;t see the email, please check your spam folder.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Link href={`/auth/login?redirect=${encodeURIComponent(validRedirectPath)}`}>
            <Button variant="outline">
              Go to login
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function CheckEmailPage() {
  return (
    <Suspense fallback={
      <div className="container flex h-screen w-full flex-col items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-2xl font-bold">Check your email</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <p className="text-lg">Loading...</p>
          </CardContent>
        </Card>
      </div>
    }>
      <CheckEmailPageContent />
    </Suspense>
  );
}