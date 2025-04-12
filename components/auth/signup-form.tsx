'use client';

import { AuthFormBase, AuthFormValues } from "./auth-form-base";
import { useSignUp } from "@/hooks/useSignUp";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "@/components/ui/use-toast";
import { signUpSchema } from "@/lib/validations/auth";

// Use the centralized schema from validations
type SignupFormValues = {
  email: string;
  password: string;
  confirmPassword: string;
};

interface SignUpFormProps {
  onSignUpSuccess: (email: string) => void;
}

export function SignUpForm({ onSignUpSuccess }: SignUpFormProps) {
  const { signUp, error: authError } = useSignUp();
  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: ""
    }
  });

  async function handleSubmit(values: SignupFormValues) {
    const authResponse = await signUp(values.email, values.password);
    if (!authResponse?.error) {
      toast({
        title: "Account created!",
        description: "Please check your email to confirm your registration.",
      });
      onSignUpSuccess(values.email);
    }
  }

  return (
    <AuthFormBase
      form={form}
      error={authError}
      isLoading={form.formState.isSubmitting}
      schemaName="signupSchema"
      onSubmit={handleSubmit}
      buttonText="Sign up"
      showConfirmPassword
    />
  );
} 