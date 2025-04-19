'use client';

import { useState, useEffect } from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useAuth, AuthErrorCode } from "@/hooks/useAuth";
import { AuthFormBase } from "./auth-form-base";
import { createRateLimitError } from "@/lib/auth-helpers";
import { loginSchema } from "@/lib/validations/auth";

type LoginFormValues = {
  email: string;
  password: string;
  rememberMe?: boolean;
};

interface LoginFormProps {
  onLoginSuccess?: () => void;
  initialRedirectTo?: string;
}

export function LoginForm({ onLoginSuccess }: LoginFormProps) {
  const { signIn, error: authError, clearError } = useAuth();
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false
    }
  });
  
  // Rate limiting state
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [cooldownEnd, setCooldownEnd] = useState<Date | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  
  // Clear previous errors when form is mounted
  useEffect(() => {
    clearError();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  // Check for stored rate limiting data on component mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
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

  async function handleSubmit(values: LoginFormValues) {
    // Check if rate limited
    if (isRateLimited) {
      return;
    }
    
    // Clear any previous errors before attempting login
    clearError();
    
    const { error } = await signIn({ 
      email: values.email, 
      password: values.password,
      rememberMe: values.rememberMe 
    });

    if (error) {
      // Store the time of this attempt regardless of error type
      if (typeof window !== 'undefined') {
        localStorage.setItem('lastAttemptTime', new Date().toISOString());
      }

      // Check if the error is specifically due to invalid credentials
      if (error.code === AuthErrorCode.INVALID_CREDENTIALS) {
        const newAttempts = loginAttempts + 1;
        setLoginAttempts(newAttempts);
        
        if (typeof window !== 'undefined') {
          localStorage.setItem('loginAttempts', newAttempts.toString());
        }

        // Apply client-side rate limit after N failed credential attempts
        if (newAttempts >= 5) {
          const cooldown = new Date();
          // 3 minute cooldown
          cooldown.setMinutes(cooldown.getMinutes() + 3);

          setIsRateLimited(true);
          setCooldownEnd(cooldown);
          
          if (typeof window !== 'undefined') {
            localStorage.setItem('cooldownEnd', cooldown.toISOString());
          }
        }
      }
    } else if (onLoginSuccess) {
      // Reset attempts on success
      setLoginAttempts(0);
      
      if (typeof window !== 'undefined') {
        localStorage.removeItem('loginAttempts');
        localStorage.removeItem('cooldownEnd');
        localStorage.removeItem('lastAttemptTime');
      }
      
      onLoginSuccess();
    }
  }

  // Determine the error to display, prioritizing rate limiting
  let displayError = authError;
  if (authError?.code === AuthErrorCode.RATE_LIMITED) {
    // Use the server's rate limit error directly
    displayError = authError;
  } else if (isRateLimited) {
    // Use the client-side rate limit error if active
    displayError = createRateLimitError(timeLeft);
  }

  return (
    <AuthFormBase
      form={form}
      isLoading={form.formState.isSubmitting}
      error={displayError}
      schemaName="loginSchema"
      onSubmit={handleSubmit}
      buttonText={isRateLimited ? `Try again in ${timeLeft}s` : "Log in"}
      showForgotPasswordLink
      showRememberMe
    />
  );
}