/*
  Consolidated PasswordForm component:
  - Accepts `mode` prop: ('reset' | 'update')
  - Renders either the reset or update password fields
  - Uses unified error handling approach with password reset hooks
*/

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  resetPasswordSchema,
  updatePasswordSchema,
} from "../../lib/validations/auth";
import { usePasswordReset } from "../../hooks/usePasswordReset";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { toast } from "../ui/use-toast";

export type PasswordFormMode = "reset" | "update";

type ResetSchema = z.infer<typeof resetPasswordSchema>;
type UpdateSchema = z.infer<typeof updatePasswordSchema>;

interface PasswordFormProps {
  mode: PasswordFormMode;
  onSuccess?: () => void;
}

export function PasswordForm({ mode, onSuccess }: PasswordFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [tokenError, setTokenError] = useState<string | null>(null);
  const { resetPassword, updatePassword, error } = usePasswordReset();

  const isReset = mode === "reset";
  const schema = isReset ? resetPasswordSchema : updatePasswordSchema;
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: isReset
      ? { email: "" }
      : { password: "", confirmPassword: "" },
  });
  
  // Token validation happens during the updateUser API call
  // This is more reliable than checking for hash presence

  async function onSubmit(values: ResetSchema | UpdateSchema) {
    setIsLoading(true);
    try {
      if (isReset && 'email' in values) {
        const { error: rErr } = await resetPassword(values.email);
        if (rErr) {
          toast({ title: "Error", description: rErr.message, variant: "destructive" });
          return;
        }
        toast({ title: "Password reset link sent", description: "Check your email." });
      } else if (!isReset && 'password' in values) {
        const { error: uErr } = await updatePassword(values.password);
        if (uErr) {
          // If we get an error here related to the token, it's an invalid/expired token
          if (uErr.message.toLowerCase().includes('token') || 
              uErr.message.toLowerCase().includes('expired') ||
              uErr.message.toLowerCase().includes('invalid')) {
            setTokenError("Invalid or expired password reset link. Please request a new password reset.");
            return;
          }
          toast({ title: "Error", description: uErr.message, variant: "destructive" });
          return;
        }
        toast({ title: "Password updated", description: "Your password has been updated successfully" });
      }
      onSuccess?.();
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {tokenError && (
          <div className="p-3 text-sm rounded-md bg-red-50 text-red-600 border border-red-200 mb-4">
            {tokenError}
            <div className="mt-2">
              <button
                type="button"
                onClick={() => window.location.href = '/auth/reset-password'}
                className="text-red-600 underline text-sm"
              >
                Request new password reset
              </button>
            </div>
          </div>
        )}
        {isReset ? (
          <FormField
            control={form.control}
            name="email"
            render={({ field }: { field: any }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    placeholder="you@example.com"
                    type="email"
                    disabled={isLoading}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ) : (
          <>
            <FormField
              control={form.control}
              name="password"
              render={({ field }: { field: any }) => (
                <FormItem>
                  <FormLabel>New Password</FormLabel>
                  <FormControl>
                    <Input type="password" disabled={isLoading} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }: { field: any }) => (
                <FormItem>
                  <FormLabel>Confirm New Password</FormLabel>
                  <FormControl>
                    <Input type="password" disabled={isLoading} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}
        {error && <p className="text-sm text-red-500">{error.message}</p>}
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading
            ? isReset ? "Sending email..." : "Updating password..."
            : isReset ? "Send reset link" : "Update password"}
        </Button>
      </form>
    </Form>
  );
}
