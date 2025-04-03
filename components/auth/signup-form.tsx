'use client';

import { useState, ChangeEvent } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from 'zod'
import { useAuth } from "@/hooks/useAuth"
import { AuthError } from "@/components/ui/auth-error"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { toast } from "@/components/ui/use-toast"

// Form validation schema
const signupSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
  confirmPassword: z.string().min(6, { message: 'Password must be at least 6 characters' })
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type FormValues = z.infer<typeof signupSchema>;

type FieldProps = {
  field: {
    value: string;
    onChange: (event: ChangeEvent<HTMLInputElement>) => void;
    onBlur: () => void;
    name: string;
    ref: React.Ref<HTMLInputElement>;
  };
};

interface SignUpFormProps {
  onSignUpSuccess: () => void;
}

export function SignUpForm({ onSignUpSuccess }: SignUpFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { signUp, error: authError } = useAuth()

  const form = useForm<FormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
  })

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true)
    
    try {
      const authResponse = await signUp(values.email, values.password)

      if (!authResponse) {
        throw new Error('Registration service is unavailable')
      }

      if (authResponse.error) {
        if (authResponse.error.message.includes('already registered')) {
          form.setError('email', {
            type: 'manual',
            message: 'This email is already registered. Please log in instead.'
          })
          setIsLoading(false)
          return
        } else if (authResponse.error.message.includes('Load failed')) {
          throw new Error('Unable to connect to the authentication service. Please check your internet connection and try again.')
        } else {
          throw new Error(authResponse.error.message || 'Signup failed')
        }
      }

      toast({
        title: 'Account created!',
        description: 'Please check your email to confirm your registration.',
      })
      onSignUpSuccess()

    } catch (error: any) {
      console.error('Signup error:', error)
      const errorMessage = error.message.includes('Load failed') 
        ? 'Unable to connect to the authentication service. Please check your internet connection and try again.'
        : error.message || 'An error occurred during signup'
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Show or hide configuration error
  const showConfigError = authError?.message && authError.message.includes('configuration')

  return (
    <Form {...form}>
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
            <FormField
              control={form.control}
              name="email"
              render={({ field }: FieldProps) => (
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
            
            <FormField
              control={form.control}
              name="password"
              render={({ field }: FieldProps) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="••••••••"
                      type="password"
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }: FieldProps) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="••••••••"
                      type="password"
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {authError && !showConfigError && (
              <AuthError
                severity="error"
                message={authError.message}
              />
            )}
            
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Creating account...' : 'Sign up'}
            </Button>
          </>
        )}
      </form>
    </Form>
  )
} 