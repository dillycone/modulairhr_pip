import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { useRouter } from 'next/navigation'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Removed dev bypass-related cookie logic. We'll rely on Supabase session
 */
export function safeNavigate(router: ReturnType<typeof useRouter>, url: string) {
  router.push(url);
}
