import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { useRouter } from 'next/navigation'
import DOMPurify from 'dompurify'
import { format } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Sanitizes HTML content to prevent XSS attacks
 */
export function sanitizeHtml(html: string): string {
  if (typeof window === 'undefined') {
    return html; // Return original content during SSR since DOMPurify requires browser APIs
  }
  return DOMPurify.sanitize(html);
}

/**
 * Format a date to YYYY-MM-DD, respecting the timezone
 * Use this instead of toISOString().slice(0, 10) which can cause timezone issues
 */
export function formatDateToYYYYMMDD(date: Date): string {
  return format(date, "yyyy-MM-dd")
}

/**
 * Removed dev bypass-related cookie logic. We'll rely on Supabase session
 */
export function safeNavigate(router: ReturnType<typeof useRouter>, url: string) {
  router.push(url);
}
