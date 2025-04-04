/*
  Consolidated PasswordForm component:
  - Accepts `mode` prop: ('reset' | 'update')
  - Renders either the reset or update password fields
  - Uses unified error handling approach with `useAuth()`
*/

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  resetPasswordSchema,
  updatePasswordSchema,
} from "../../lib/validations/auth";
import { useAuth } from "../../hooks/useAuth";
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
  const { resetPassword, updatePassword, error } = useAuth();

  const isReset = mode === "reset";
  const schema = isReset ? resetPasswordSchema : updatePasswordSchema;
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: isReset
      ? { email: "" }
      : { password: "", confirmPassword: "" },
  });

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
