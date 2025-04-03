'use client';

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import Link from 'next/link'
import { z } from 'zod'
import { useAuth } from "@/hooks/useAuth"
import { AuthError } from "@/components/ui/auth-error"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type LoginFormValues = z.infer<typeof loginSchema>

interface LoginFormProps {
  onLoginSuccess: () => void
  initialRedirectTo?: string
}

export function LoginForm({ onLoginSuccess, initialRedirectTo = '/dashboard' }: LoginFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { signIn, error: authError } = useAuth()
  
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const onSubmit = async (values: LoginFormValues) => {
    setIsLoading(true)
    console.log('Login attempt started for:', values.email)

    try {
      const authResponse = await signIn({
        email: values.email,
        password: values.password,
      })

      console.log('Login response received:', {
        success: !authResponse.error,
        hasUser: !!authResponse.data?.user,
        hasSession: !!authResponse.data?.session
      })

      if (authResponse.error) {
        setIsLoading(false)
        return
      }

      try {
        localStorage.removeItem('auth_redirect_attempt');
      } catch (e) {
        console.error('Failed to clear redirect attempt flag:', e);
      }

      console.log('Login successful, calling onLoginSuccess ...')
      onLoginSuccess();
    } catch (error: any) {
      console.error('Login error:', error)
      form.setError('root', {
        type: 'manual',
        message: error.message || 'An unexpected error occurred during login'
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Show configuration error if auth is not properly set up
  const showConfigError = authError?.code === 'auth/configuration-error' || 
                         (authError?.message && authError.message.includes('configuration'))

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      {showConfigError ? (
        <div className="rounded-md bg-yellow-50 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">Configuration Error</h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>The authentication system is not properly configured. This is a development environment issue.</p>
                <p className="mt-1 font-medium">Steps to fix:</p>
                <ol className="list-decimal pl-5 mt-1 space-y-1">
                  <li>Update your .env.local file with your Supabase credentials</li>
                  <li>Restart the development server</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Email
            </label>
            <Input
              id="email"
              placeholder="you@example.com"
              type="email"
              {...form.register('email')}
              disabled={isLoading}
            />
            {form.formState.errors.email && (
              <p className="text-sm text-red-500">{form.formState.errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Password
              </label>
              <Link href="/auth/reset-password" className="text-xs text-primary hover:underline">
                Forgot password?
              </Link>
            </div>
            <Input
              id="password"
              placeholder="••••••••"
              type="password"
              {...form.register('password')}
              disabled={isLoading}
            />
            {form.formState.errors.password && (
              <p className="text-sm text-red-500">{form.formState.errors.password.message}</p>
            )}
          </div>

          {authError && !showConfigError && (
            <AuthError
              severity="error"
              message={authError.message}
            />
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? 'Logging in...' : 'Log in'}
          </Button>
        </>
      )}
    </form>
  )
}
