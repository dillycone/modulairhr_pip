'use client';

import { AuthFormBase } from "./auth-form-base";
import { useAuth } from "@/hooks/useAuth";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "@/components/ui/use-toast";

const signupSchema = z
  .object({
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Password must be at least 6 characters"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type SignupFormValues = z.infer<typeof signupSchema>;

interface SignUpFormProps {
  onSignUpSuccess: () => void;
}

export function SignUpForm({ onSignUpSuccess }: SignUpFormProps) {
  const { signUp, error: authError } = useAuth();
  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
  });

  async function handleSubmit(values: SignupFormValues) {
    const authResponse = await signUp(values.email, values.password);
    if (!authResponse?.error) {
      toast({
        title: "Account created!",
        description: "Please check your email to confirm your registration.",
      });
      onSignUpSuccess();
    }
  }

  return (
    <AuthFormBase
      form={form}
      error={authError?.message || ""}
      isLoading={form.formState.isSubmitting}
      schemaName="signupSchema"
      onSubmit={handleSubmit}
      buttonText="Sign up"
      showConfirmPassword
    />
  );
} 