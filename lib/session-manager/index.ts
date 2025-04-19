// Re-export session manager functions based on execution context
import * as serverHelpers from '../session-manager-server';

// Detect if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

// Client-side only functions
let clientSideHelpers: any = {};

// Dynamically import client-side helpers only in browser environments
if (isBrowser) {
  // This import works because Next.js will tree-shake it out in server contexts
  import('../session-manager').then(module => {
    clientSideHelpers = module;
  }).catch(error => {
    console.error('Failed to load client session manager:', error);
  });
}

// Functions that depend on the browser environment
export function refreshSession() {
  if (!isBrowser) {
    console.warn('refreshSession called in server context - use refreshServerSession instead');
    return Promise.resolve({ data: { session: null }, error: null });
  }
  
  if (!clientSideHelpers.refreshSession) {
    return Promise.resolve({ data: { session: null }, error: { message: 'Client session manager not loaded' } });
  }
  
  return clientSideHelpers.refreshSession();
}

export function getSessionWithRefresh(forceRefresh = false) {
  if (!isBrowser) {
    console.warn('getSessionWithRefresh called in server context - use getServerSession instead');
    return Promise.resolve({ data: { session: null }, error: null });
  }
  
  if (!clientSideHelpers.getSessionWithRefresh) {
    return Promise.resolve({ data: { session: null }, error: { message: 'Client session manager not loaded' } });
  }
  
  return clientSideHelpers.getSessionWithRefresh(forceRefresh);
}

export function isSessionRefreshInProgress() {
  if (!isBrowser) {
    // In server context, refresh is never in progress
    return false;
  }
  
  if (!clientSideHelpers.isSessionRefreshInProgress) {
    return false;
  }
  
  return clientSideHelpers.isSessionRefreshInProgress();
}

// Re-export the server functions
export const { getServerSession, refreshServerSession } = serverHelpers; 