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
const resetPasswordSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
});

type FormValues = z.infer<typeof resetPasswordSchema>;

type FieldProps = {
  field: {
    value: string;
    onChange: (event: ChangeEvent<HTMLInputElement>) => void;
    onBlur: () => void;
    name: string;
    ref: React.Ref<HTMLInputElement>;
  };
};

interface ResetPasswordFormProps {
  onResetSuccess: () => void;
}

export function ResetPasswordForm({ onResetSuccess }: ResetPasswordFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { resetPassword, error: authError } = useAuth()

  const form = useForm<FormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: '',
    },
  })

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true)
    
    try {
      const { error } = await resetPassword(values.email)

      if (error) {
        setIsLoading(false)
        return
      }

      toast({
        title: 'Password reset email sent',
        description: 'Check your email for a link to reset your password',
      })
      
      onResetSuccess()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
        
        {authError && (
          <AuthError
            severity="error"
            message={authError.message}
          />
        )}
        
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? 'Sending email...' : 'Send reset link'}
        </Button>
      </form>
    </Form>
  )
} 