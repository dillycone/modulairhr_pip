'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UpdatePasswordForm } from '@/components/auth/update-password-form';

export default function UpdatePasswordPage() {
  const router = useRouter();

  const handleUpdateSuccess = () => {
    router.push('/auth/login');
  };

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
          <UpdatePasswordForm onUpdateSuccess={handleUpdateSuccess} />
        </CardContent>
      </Card>
    </div>
  );
} 