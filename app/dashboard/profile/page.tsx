'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast'; // Assuming you have set up toasts
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from 'lucide-react';

export default function ProfilePage() {
  const { user, loading: authLoading, updatePassword } = useAuth();
  const router = useRouter();
  const { toast } = useToast(); // For user feedback

  // State for forms
  const [name, setName] = useState('');
  const [isSavingName, setIsSavingName] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setName(user.user_metadata?.name || '');
    }
  }, [user]);

  // Redirect if not logged in (although middleware should handle this)
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login?redirect=/dashboard/profile');
    }
  }, [authLoading, user, router]);

  const handleNameUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !name.trim()) {
      setNameError('Name cannot be empty.');
      return;
    }
    setNameError(null);
    setIsSavingName(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: { name: name.trim() },
      });
      if (error) throw error;
      toast({ title: "Success", description: "Name updated successfully." });
      // Optionally, refresh user data if useAuth doesn't automatically handle USER_UPDATED event well
    } catch (error: any) {
      console.error("Error updating name:", error);
      setNameError(error.message || 'Failed to update name.');
      toast({ variant: "destructive", title: "Error", description: error.message || 'Failed to update name.' });
    } finally {
      setIsSavingName(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }
    if (newPassword.length < 6) { // Example minimum length
        setPasswordError("Password must be at least 6 characters long.");
        return;
    }

    setIsChangingPassword(true);
    try {
      // Note: Supabase updatePassword doesn't require current password
      // Add check if needed based on your security policy
      const { error } = await updatePassword(newPassword);
      if (error) {
          throw new Error(error.message);
      }
      toast({ title: "Success", description: "Password updated successfully." });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      console.error("Error updating password:", error);
      setPasswordError(error.message || 'Failed to update password.');
      toast({ variant: "destructive", title: "Error", description: error.message || 'Failed to update password.' });
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      <Breadcrumb className="mb-4">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>My Profile</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <h1 className="text-3xl font-bold mb-6">My Profile</h1>

      {/* User Information Card */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>User Information</CardTitle>
          <CardDescription>Manage your personal details.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={user.email || ''} disabled />
            <p className="text-sm text-muted-foreground">Your email address cannot be changed here.</p>
          </div>

          <form onSubmit={handleNameUpdate} className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <div className="flex items-center space-x-2">
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isSavingName}
                className="flex-grow"
              />
               <Button type="submit" disabled={isSavingName || name === (user.user_metadata?.name || '')}>
                 {isSavingName ? 'Saving...' : 'Save Name'}
              </Button>
            </div>
             {nameError && <p className="text-sm text-red-600">{nameError}</p>}
          </form>

           {/* Placeholder for Avatar */}
           <Separator />
            <div>
                 <Label>Profile Picture</Label>
                 <div className="mt-2 flex items-center space-x-4 p-4 border rounded-md bg-slate-50">
                    {/* Add Avatar component here when ready */}
                    <span className="text-muted-foreground text-sm">
                        Profile picture upload is coming soon.
                    </span>
                 </div>
            </div>
        </CardContent>
      </Card>

      {/* Security Card */}
      <Card>
        <CardHeader>
          <CardTitle>Security</CardTitle>
          <CardDescription>Manage your account security settings.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Change Password Section */}
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <h3 className="text-lg font-medium">Change Password</h3>
            {/* Optional: Current Password Input - Supabase doesn't require it by default */}
            {/* <div className="space-y-1">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                disabled={isChangingPassword}
              />
            </div> */}
            <div className="space-y-1">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={isChangingPassword}
                required
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isChangingPassword}
                required
              />
            </div>
            {passwordError && (
                 <Alert variant="destructive">
                   <Terminal className="h-4 w-4" />
                   <AlertTitle>Error</AlertTitle>
                   <AlertDescription>{passwordError}</AlertDescription>
                 </Alert>
            )}
            <Button type="submit" disabled={isChangingPassword}>
              {isChangingPassword ? 'Changing...' : 'Change Password'}
            </Button>
          </form>

          <Separator />

          {/* 2FA Placeholder Section */}
          <div className="space-y-2">
             <h3 className="text-lg font-medium">Two-Factor Authentication (2FA)</h3>
             <p className="text-sm text-muted-foreground">
                Enhance your account security by enabling two-factor authentication.
             </p>
             <Alert>
                <Terminal className="h-4 w-4" />
                <AlertTitle>Coming Soon!</AlertTitle>
                <AlertDescription>
                    2FA management options will be available here in a future update.
                </AlertDescription>
             </Alert>
             {/* Example disabled button: */}
             {/* <Button disabled>Enable 2FA (Coming Soon)</Button> */}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 