'use client';

import { AuthFormBase } from "./auth-form-base";
import { useAuth } from "@/hooks/useAuth";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter, useSearchParams } from "next/navigation";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

interface LoginFormProps {
  onLoginSuccess?: () => void;
  initialRedirectTo?: string;
}

export function LoginForm({ onLoginSuccess, initialRedirectTo = "/dashboard" }: LoginFormProps) {
  const { signIn, error: authError } = useAuth();
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || initialRedirectTo;

  async function handleSubmit(values: LoginFormValues) {
    const { error } = await signIn({ email: values.email, password: values.password });
    if (!error) {
      if (onLoginSuccess) onLoginSuccess();
      else router.push(redirectTo);
    }
  }

  return (
    <AuthFormBase
      form={form}
      isLoading={form.formState.isSubmitting}
      error={authError}
      schemaName="loginSchema"
      onSubmit={handleSubmit}
      buttonText="Log in"
      showForgotPasswordLink
    />
  );
}
