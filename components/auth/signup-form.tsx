import { useState } from "react"
import { signUpSchema, type SignUpFormData } from "@/lib/validations/auth"
import { Form, FormField } from "@/components/ui/form-components"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface SignUpFormProps {
  onSubmit: (data: SignUpFormData) => Promise<void>
}

export function SignUpForm({ onSubmit }: SignUpFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (data: SignUpFormData) => {
    try {
      setIsLoading(true)
      setError(null)
      await onSubmit(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form
      schema={signUpSchema}
      onSubmit={handleSubmit}
      className="space-y-4"
    >
      {({ register, formState: { errors } }) => (
        <>
          <FormField
            label="Email"
            error={errors.email?.message}
          >
            <Input
              type="email"
              {...register("email")}
              placeholder="Enter your email"
              disabled={isLoading}
            />
          </FormField>
          <FormField
            label="Password"
            error={errors.password?.message}
          >
            <Input
              type="password"
              {...register("password")}
              placeholder="Enter your password"
              disabled={isLoading}
            />
          </FormField>
          <FormField
            label="Confirm Password"
            error={errors.confirmPassword?.message}
          >
            <Input
              type="password"
              {...register("confirmPassword")}
              placeholder="Confirm your password"
              disabled={isLoading}
            />
          </FormField>
          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}
          <Button
            type="submit"
            className="w-full"
            isLoading={isLoading}
          >
            Create Account
          </Button>
        </>
      )}
    </Form>
  )
} 