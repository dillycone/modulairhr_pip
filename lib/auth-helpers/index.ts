// Re-export auth helpers based on execution context
import * as serverHelpers from '../auth-helpers-server';

// Export types that are common to both environments
export type { AppAuthError } from '../auth-helpers-server';
export { AuthErrorCode } from '../auth-helpers-server';

// Detect if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

// Common functions that work in both environments
export const { mapAuthError, createRateLimitError } = serverHelpers;

// Client-side only functions
let clientSideHelpers: any = {};

// Dynamically import client-side helpers only in browser environments
if (isBrowser) {
  // This import works because Next.js will tree-shake it out in server contexts
  import('../auth-helpers').then(module => {
    clientSideHelpers = module;
  }).catch(error => {
    console.error('Failed to load client auth helpers:', error);
  });
}

// Functions that depend on the browser environment
export function verifySession() {
  if (!isBrowser) {
    console.warn('verifySession called in server context');
    return Promise.resolve({ user: null, error: null });
  }
  
  if (!clientSideHelpers.verifySession) {
    return Promise.resolve({ user: null, error: { code: 'session-error', message: 'Client auth helpers not loaded' } });
  }
  
  return clientSideHelpers.verifySession();
}

export function refreshSessionFromCookies() {
  if (!isBrowser) {
    console.warn('refreshSessionFromCookies called in server context');
    return Promise.resolve({ user: null, error: null });
  }
  
  if (!clientSideHelpers.refreshSessionFromCookies) {
    return Promise.resolve({ user: null, error: { code: 'session-error', message: 'Client auth helpers not loaded' } });
  }
  
  return clientSideHelpers.refreshSessionFromCookies();
}

export function signOutAndCleanup() {
  if (!isBrowser) {
    console.warn('signOutAndCleanup called in server context');
    return Promise.resolve();
  }
  
  if (!clientSideHelpers.signOutAndCleanup) {
    return Promise.resolve();
  }
  
  return clientSideHelpers.signOutAndCleanup();
} 