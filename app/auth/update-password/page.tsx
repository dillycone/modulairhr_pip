"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import { PasswordForm } from "../../../components/auth/password-form";

export default function UpdatePasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Update Password</CardTitle>
          <CardDescription className="text-center">
            Enter your new password
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PasswordForm mode="update" onSuccess={() => window.location.href = "/auth/login"} />
        </CardContent>
      </Card>
    </div>
  );
}
