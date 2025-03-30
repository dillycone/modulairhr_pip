import { useState } from "react"
import { loginSchema, type LoginFormData } from "@/lib/validations/auth"
import { Form, FormField } from "@/components/ui/form-components"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface LoginFormProps {
  onSubmit: (data: LoginFormData) => Promise<void>
}

export function LoginForm({ onSubmit }: LoginFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (data: LoginFormData) => {
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
      schema={loginSchema}
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
          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}
          <Button
            type="submit"
            className="w-full"
            isLoading={isLoading}
          >
            Sign In
          </Button>
        </>
      )}
    </Form>
  )
} 