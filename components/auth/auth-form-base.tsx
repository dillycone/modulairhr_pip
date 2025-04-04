"use client";
import React from "react";
import Link from "next/link";
import { UseFormReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AuthError } from "@/components/ui/auth-error";

/**
 * This component factors out common auth form styling
 * for both login and signup, reducing code duplication.
 */

interface AuthFormBaseProps {
  form: UseFormReturn<any>;
  onSubmit: (values: any) => void | Promise<void>;
  error?: string;
  isLoading?: boolean;
  buttonText: string;
  schemaName?: string;
  showForgotPasswordLink?: boolean;
  showConfirmPassword?: boolean; // used by signup
}

export function AuthFormBase({
  form,
  onSubmit,
  error,
  isLoading,
  buttonText,
  showForgotPasswordLink,
  showConfirmPassword,
}: AuthFormBaseProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = form;

  const hasConfigError =
    error?.toLowerCase()?.includes("configuration") ||
    error?.toLowerCase()?.includes("not properly configured");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {hasConfigError ? (
        <div className="rounded-md bg-yellow-50 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-yellow-400"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Configuration Error
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  The authentication system is not properly configured.
                  This is a development environment issue.
                </p>
                <p className="mt-1 font-medium">Steps to fix:</p>
                <ol className="list-decimal pl-5 mt-1 space-y-1">
                  <li>
                    Update your <code>.env.local</code> file with your
                    Supabase credentials
                  </li>
                  <li>Restart the development server</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Email
            </label>
            <Input
              id="email"
              placeholder="you@example.com"
              type="email"
              disabled={isLoading}
              {...register("email")}
            />
            {errors?.email?.message && (
              <p className="text-sm text-red-500">{String(errors.email.message)}</p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label
                htmlFor="password"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Password
              </label>
              {showForgotPasswordLink && (
                <Link href="/auth/reset-password" className="text-xs text-primary hover:underline">
                  Forgot password?
                </Link>
              )}
            </div>
            <Input
              id="password"
              placeholder="••••••••"
              type="password"
              disabled={isLoading}
              {...register("password")}
            />
            {errors?.password?.message && (
              <p className="text-sm text-red-500">{String(errors.password.message)}</p>
            )}
          </div>

          {showConfirmPassword && (
            <div className="space-y-2">
              <label
                htmlFor="confirmPassword"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Confirm Password
              </label>
              <Input
                id="confirmPassword"
                placeholder="••••••••"
                type="password"
                disabled={isLoading}
                {...register("confirmPassword")}
              />
              {errors?.confirmPassword?.message && (
                <p className="text-sm text-red-500">
                  {String(errors.confirmPassword.message)}
                </p>
              )}
            </div>
          )}

          {error && !hasConfigError && (
            <AuthError severity="error" message={error} />
          )}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Please wait..." : buttonText}
          </Button>
        </>
      )}
    </form>
  );
} 