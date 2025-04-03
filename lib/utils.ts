import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function setAuthBypassCookie(durationDays = 1) {
  const expirationSeconds = durationDays * 24 * 60 * 60;
  document.cookie = `auth_bypass_token=dev_bypass_token; path=/; max-age=${expirationSeconds}`;
  console.log(`Auth bypass cookie set for ${durationDays} day(s)`);
  return true;
}

export function checkAuthBypassCookie() {
  const cookies = document.cookie.split(';');
  const bypassCookie = cookies.find(cookie => cookie.trim().startsWith('auth_bypass_token='));
  return !!bypassCookie;
}

export function removeAuthBypassCookie() {
  document.cookie = 'auth_bypass_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
  console.log('Auth bypass cookie removed');
  return true;
}
