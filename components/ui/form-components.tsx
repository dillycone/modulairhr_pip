import * as React from "react"
import { useForm, UseFormReturn } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

export interface FormProps<T extends z.ZodType> {
  schema: T
  onSubmit: (values: z.infer<T>) => void | Promise<void>
  children: (methods: UseFormReturn<z.infer<T>>) => React.ReactNode
  className?: string
}

export function Form<T extends z.ZodType>({
  schema,
  onSubmit,
  children,
  className,
}: FormProps<T>) {
  const methods = useForm<z.infer<T>>({
    resolver: zodResolver(schema),
  })

  return (
    <form
      className={className}
      onSubmit={methods.handleSubmit(onSubmit)}
      noValidate
    >
      {children(methods)}
    </form>
  )
}

export interface FormFieldProps {
  label?: string
  error?: string
  children: React.ReactNode
}

export function FormField({ label, error, children }: FormFieldProps) {
  return (
    <div className="space-y-2">
      {label && (
        <label className="text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      {children}
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  )
} 