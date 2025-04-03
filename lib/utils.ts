import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { useRouter } from 'next/navigation'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Helper for navigation that can do full reload or client route
 * Typically prefer router.push, but if a full reload is needed, unify here.
 */
export function safeNavigate(router: ReturnType<typeof useRouter>, url: string, fullReload = false) {
  if (fullReload) window.location.href = url; else router.push(url);
}

/**
 * Checks if bypass cookie is set (for dev-only use).
 */
export function checkBypassCookie(): boolean {
  const cookies = (typeof document !== 'undefined') ? document.cookie.split(';') : [];
  return cookies.some(cookie => cookie.trim().startsWith('auth_bypass_token='));
}

/**
 * Sets a dev bypass cookie
 */
export function setBypassCookie(days=1) {
  if (typeof document === 'undefined') return;
  const expiresSeconds = days * 24 * 60 * 60;
  document.cookie = `auth_bypass_token=dev_mode; path=/; max-age=${expiresSeconds}`;
}

/**
 * Clears the bypass cookie
 */
export function clearBypassCookie() {
  if (typeof document === 'undefined') return;
  document.cookie = 'auth_bypass_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}

// Additional utility functions (setAuthBypassCookie, etc.) removed
// Example of how you might unify older cookie logic into the new
// checkBypassCookie / setBypassCookie / clearBypassCookie approach above
