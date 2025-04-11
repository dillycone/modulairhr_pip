import { redirect } from 'next/navigation';

export function isValidRedirectUrl(url: string): boolean {
  // Only allow relative URLs or URLs to our domain
  if (url.startsWith('/')) return true;
  
  try {
    const urlObj = new URL(url);
    return urlObj.hostname === window.location.hostname;
  } catch {
    return false;
  }
}

export function safeRedirect(redirectTo: string | null, defaultPath: string = '/dashboard'): string {
  const path = redirectTo || defaultPath;
  return isValidRedirectUrl(path) ? path : defaultPath;
}

export function performRedirect(router: any, redirectTo: string | null, defaultPath: string = '/dashboard'): void {
  router.push(safeRedirect(redirectTo, defaultPath));
}