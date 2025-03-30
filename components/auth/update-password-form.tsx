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
const updatePasswordSchema = z.object({
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
  confirmPassword: z.string().min(6, { message: 'Password must be at least 6 characters' }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type FormValues = z.infer<typeof updatePasswordSchema>;

type FieldProps = {
  field: {
    value: string;
    onChange: (event: ChangeEvent<HTMLInputElement>) => void;
    onBlur: () => void;
    name: string;
    ref: React.Ref<HTMLInputElement>;
  };
};

interface UpdatePasswordFormProps {
  onUpdateSuccess: () => void;
}

export function UpdatePasswordForm({ onUpdateSuccess }: UpdatePasswordFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { updatePassword, error: authError } = useAuth()

  const form = useForm<FormValues>({
    resolver: zodResolver(updatePasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  })

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true)
    
    try {
      const { error } = await updatePassword(values.password)

      if (error) {
        throw error
      }

      toast({
        title: 'Password updated',
        description: 'Your password has been updated successfully',
      })
      
      onUpdateSuccess()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update password',
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
          name="password"
          render={({ field }: FieldProps) => (
            <FormItem>
              <FormLabel>New Password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="••••••••"
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
              <FormLabel>Confirm New Password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="••••••••"
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
          {isLoading ? 'Updating password...' : 'Update password'}
        </Button>
      </form>
    </Form>
  )
} 