'use client';

import { useState, useEffect } from 'react';
import { AuthFormBase, AuthFormValues } from "./auth-form-base";
import { useSignIn } from "@/hooks/useSignIn";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter, useSearchParams } from "next/navigation";
import { loginSchema } from "@/lib/validations/auth";
import { createRateLimitError } from "@/lib/error-helpers";

type LoginFormValues = {
  email: string;
  password: string;
  rememberMe?: boolean;
};

interface LoginFormProps {
  onLoginSuccess?: () => void;
  initialRedirectTo?: string;
}

export function LoginForm({ onLoginSuccess, initialRedirectTo = "/dashboard" }: LoginFormProps) {
  const { signIn, error: authError } = useSignIn();
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false
    }
  });
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || initialRedirectTo;
  
  // Rate limiting state
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [cooldownEnd, setCooldownEnd] = useState<Date | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  
  // Check for stored rate limiting data on component mount
  useEffect(() => {
    const storedAttempts = localStorage.getItem('loginAttempts');
    const storedCooldownEnd = localStorage.getItem('cooldownEnd');
    
    if (storedAttempts) {
      const attempts = parseInt(storedAttempts, 10);
      
      // Check if attempts were from a previous session (over 30 minutes old)
      const lastAttemptTime = localStorage.getItem('lastAttemptTime');
      const now = new Date();
      
      if (lastAttemptTime) {
        const timeSinceLastAttempt = now.getTime() - new Date(lastAttemptTime).getTime();
        const thirtyMinutesInMs = 30 * 60 * 1000;
        
        // If it's been more than 30 minutes, reset attempts
        if (timeSinceLastAttempt > thirtyMinutesInMs) {
          localStorage.removeItem('loginAttempts');
          localStorage.removeItem('cooldownEnd');
          localStorage.removeItem('lastAttemptTime');
          setLoginAttempts(0);
          setIsRateLimited(false);
          return;
        }
      }
      
      setLoginAttempts(attempts);
    }
    
    if (storedCooldownEnd) {
      const cooldownDate = new Date(storedCooldownEnd);
      if (cooldownDate > new Date()) {
        setIsRateLimited(true);
        setCooldownEnd(cooldownDate);
      } else {
        // Reset if cooldown has expired
        localStorage.removeItem('loginAttempts');
        localStorage.removeItem('cooldownEnd');
        localStorage.removeItem('lastAttemptTime');
        setIsRateLimited(false);
      }
    }
  }, []);

  // Update countdown timer if rate limited
  useEffect(() => {
    if (isRateLimited && cooldownEnd) {
      const timer = setInterval(() => {
        const now = new Date();
        const timeLeftMs = cooldownEnd.getTime() - now.getTime();
        
        if (timeLeftMs <= 0) {
          setIsRateLimited(false);
          setCooldownEnd(null);
          localStorage.removeItem('loginAttempts');
          localStorage.removeItem('cooldownEnd');
          localStorage.removeItem('lastAttemptTime');
          clearInterval(timer);
        } else {
          setTimeLeft(Math.ceil(timeLeftMs / 1000));
        }
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [isRateLimited, cooldownEnd]);
  
  // Check for error parameters from the callback page
  const errorType = searchParams.get("error");
  const errorMessage = searchParams.get("message");
  const callbackError = errorType && errorMessage 
    ? { code: errorType, message: decodeURIComponent(errorMessage) }
    : errorType ? { code: errorType, message: `Authentication error (${errorType})` } : null;

  async function handleSubmit(values: LoginFormValues) {
    // Check if rate limited
    if (isRateLimited) {
      return;
    }
    
    const { error } = await signIn({ 
      email: values.email, 
      password: values.password,
      rememberMe: values.rememberMe 
    });
    
    if (error) {
      // Store the time of this attempt
      localStorage.setItem('lastAttemptTime', new Date().toISOString());
      
      // Increment login attempts on failure
      const newAttempts = loginAttempts + 1;
      setLoginAttempts(newAttempts);
      localStorage.setItem('loginAttempts', newAttempts.toString());
      
      // Rate limit after 8 failed attempts instead of 5
      if (newAttempts >= 8) {
        const cooldown = new Date();
        // 3 minute cooldown instead of 5
        cooldown.setMinutes(cooldown.getMinutes() + 3);
        
        setIsRateLimited(true);
        setCooldownEnd(cooldown);
        localStorage.setItem('cooldownEnd', cooldown.toISOString());
      }
    } else if (onLoginSuccess) {
      // Reset attempts on success
      setLoginAttempts(0);
      localStorage.removeItem('loginAttempts');
      localStorage.removeItem('cooldownEnd');
      localStorage.removeItem('lastAttemptTime');
      onLoginSuccess();
    }
  }

  // Create a rate limit error message
  const rateLimitError = isRateLimited ? createRateLimitError(timeLeft) : null;

  return (
    <AuthFormBase
      form={form}
      isLoading={form.formState.isSubmitting}
      error={rateLimitError || callbackError || authError}
      schemaName="loginSchema"
      onSubmit={handleSubmit}
      buttonText={isRateLimited ? `Try again in ${timeLeft}s` : "Log in"}
      showForgotPasswordLink
      showRememberMe
    />
  );
}
