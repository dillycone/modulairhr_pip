/**
 * Unified form for resetting or updating a password.
 * We can pass a prop like "mode" => 'reset' | 'update'
 */
"use client";
import { useState, ChangeEvent } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { resetPasswordSchema, updatePasswordSchema } from "@/lib/validations/auth";
import { useAuth } from "@/hooks/useAuth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "@/components/ui/use-toast";

type PasswordFormMode = 'reset' | 'update';

type ResetSchema = z.infer<typeof resetPasswordSchema>;
type UpdateSchema = z.infer<typeof updatePasswordSchema>;

interface ResetOrUpdatePasswordFormProps {
  mode: PasswordFormMode;
  onSuccess?: () => void;
}

export function ResetOrUpdatePasswordForm({ mode, onSuccess }: ResetOrUpdatePasswordFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { resetPassword, updatePassword, error } = useAuth();

  // For "reset" => email only
  // For "update" => password, confirmPassword

  if (mode === 'reset') {
    const form = useForm<ResetSchema>({
      resolver: zodResolver(resetPasswordSchema),
      defaultValues: { email: '' },
    });

    const onSubmitReset = async (values: ResetSchema) => {
      setIsLoading(true);
      try {
        const { error: rError } = await resetPassword(values.email);
        if (rError) {
          toast({ title: 'Error', description: rError.message, variant: 'destructive' });
          setIsLoading(false);
          return;
        }
        toast({ title: 'Password reset link sent', description: 'Check your email.' });
        onSuccess?.();
      } finally {
        setIsLoading(false);
      }
    };

    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmitReset)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="you@example.com" type="email" disabled={isLoading} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {error && <p className="text-sm text-red-500">{error.message}</p>}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Sending email...' : 'Send reset link'}
          </Button>
        </form>
      </Form>
    );
  }
  else {
    // "update" mode
    const form = useForm<UpdateSchema>({
      resolver: zodResolver(updatePasswordSchema),
      defaultValues: { password: '', confirmPassword: '' },
    });

    const onSubmitUpdate = async (values: UpdateSchema) => {
      setIsLoading(true);
      try {
        const { error: uError } = await updatePassword(values.password);
        if (uError) {
          toast({ title: 'Error', description: uError.message, variant: 'destructive' });
          setIsLoading(false);
          return;
        }
        toast({ title: 'Password updated', description: 'Your password has been updated successfully' });
        onSuccess?.();
      } finally {
        setIsLoading(false);
      }
    };

    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmitUpdate)} className="space-y-4">
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>New Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="••••••••" disabled={isLoading} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm New Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="••••••••" disabled={isLoading} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {error && <p className="text-sm text-red-500">{error.message}</p>}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Updating password...' : 'Update password'}
          </Button>
        </form>
      </Form>
    );
  }
} 