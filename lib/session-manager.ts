"use client";

import { supabase } from '@/lib/supabase';

// Session manager that enforces a single source of truth for session refreshes
// and prevents rate-limiting issues with excessive refresh calls

// Flag to check if we're in browser environment
const isBrowser = typeof window !== 'undefined';

// Constants for session refresh timing
const SESSION_REFRESH_KEY = 'last_session_refresh';
const REFRESH_INTERVAL_MS = 10 * 60 * 1000; // 10 minutes
const REFRESH_JITTER_MS = 30 * 1000; // Add random jitter to avoid thundering herd
const ERROR_COUNT_KEY = 'session_refresh_errors';
const BACKOFF_INCREMENT_MS = 60 * 1000; // Add 1 minute for each error
const MAX_BACKOFF_MS = 30 * 60 * 1000; // Max 30 minutes
const SESSION_REFRESH_IN_PROGRESS = 'session_refresh_in_progress';

// Singleton to track in-memory refresh state
let _isRefreshInProgress = false;
let _lastRefreshTime = 0;
let _refreshPromise: Promise<any> | null = null;

// Default empty response
const emptyResponse = {
  data: { session: null },
  error: null
};

/**
 * Check if enough time has passed since the last refresh based on error count
 */
function canRefreshSession(): boolean {
  if (!isBrowser) return false;
  
  try {
    const lastRefresh = localStorage.getItem(SESSION_REFRESH_KEY);
    if (!lastRefresh) return true;
    
    const lastRefreshTime = parseInt(lastRefresh, 10);
    _lastRefreshTime = lastRefreshTime;
    const now = Date.now();
    const backoffTime = getBackoffTime();
    return (now - lastRefreshTime) > backoffTime;
  } catch (e) {
    // If localStorage fails, default to allowing refresh
    return true;
  }
}

/**
 * Calculate backoff time based on error count
 */
function getBackoffTime(): number {
  if (!isBrowser) return REFRESH_INTERVAL_MS;
  
  try {
    const errorCount = parseInt(localStorage.getItem(ERROR_COUNT_KEY) || '0', 10);
    // Calculate backoff time based on errors with jitter
    const jitter = Math.floor(Math.random() * REFRESH_JITTER_MS);
    return Math.min(
      REFRESH_INTERVAL_MS + (errorCount * BACKOFF_INCREMENT_MS) + jitter,
      MAX_BACKOFF_MS
    );
  } catch (e) {
    return REFRESH_INTERVAL_MS;
  }
}

/**
 * Update the timestamp of the last successful refresh
 */
function updateLastRefreshTime(): void {
  if (!isBrowser) return;
  
  try {
    const now = Date.now();
    localStorage.setItem(SESSION_REFRESH_KEY, now.toString());
    _lastRefreshTime = now;
  } catch (e) {
    console.warn('Failed to update session refresh timestamp', e);
  }
}

/**
 * Track refresh errors to implement exponential backoff
 */
function trackRefreshError(): void {
  if (!isBrowser) return;
  
  try {
    const errorCount = parseInt(localStorage.getItem(ERROR_COUNT_KEY) || '0', 10);
    localStorage.setItem(ERROR_COUNT_KEY, (errorCount + 1).toString());
  } catch (e) {
    console.warn('Failed to track refresh error', e);
  }
}

/**
 * Reset error counter after successful refresh
 */
function resetRefreshErrors(): void {
  if (!isBrowser) return;
  
  try {
    localStorage.setItem(ERROR_COUNT_KEY, '0');
  } catch (e) {
    console.warn('Failed to reset refresh errors', e);
  }
}

/**
 * Centralized function to refresh the session
 * Ensures that only one refresh attempt happens at a time
 * and implements backoff strategy for rate limiting
 */
export async function refreshSession() {
  // For SSR, return empty session without error
  if (!isBrowser) {
    return emptyResponse;
  }
  
  // If a refresh is already in progress, return the existing promise
  if (_isRefreshInProgress && _refreshPromise) {
    return _refreshPromise;
  }
  
  // Check if we can refresh based on timing
  if (!canRefreshSession()) {
    console.log('Skipping session refresh due to rate limiting');
    return { 
      data: { session: null }, 
      error: { message: 'Refresh skipped due to rate limiting' } 
    };
  }
  
  // Mark refresh as in progress
  _isRefreshInProgress = true;
  
  try {
    localStorage.setItem(SESSION_REFRESH_IN_PROGRESS, 'true');
  } catch (e) {
    // Ignore localStorage errors
  }
  
  // Create the refresh promise
  _refreshPromise = (async () => {
    try {
      console.log('Refreshing session via centralized manager...');
      
      // Update timestamp before attempting to refresh
      updateLastRefreshTime();
      
      // Check for null supabase client
      if (!supabase || !supabase.auth) {
        console.error('Supabase client not available during refresh');
        return emptyResponse;
      }
      
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) {
        console.error('Session refresh error:', error);
        
        // Only track rate limiting errors for backoff
        if (error.message?.includes('rate limit') || 
            error.message?.includes('too many requests')) {
          trackRefreshError();
        }
        
        return { data: { session: null }, error };
      }
      
      // Reset error count on success
      resetRefreshErrors();
      
      return { data, error: null };
    } catch (e) {
      console.error('Unexpected error during session refresh:', e);
      return { 
        data: { session: null }, 
        error: e 
      };
    } finally {
      // Clear in-progress flag
      _isRefreshInProgress = false;
      _refreshPromise = null;
      
      try {
        localStorage.removeItem(SESSION_REFRESH_IN_PROGRESS);
      } catch (e) {
        // Ignore localStorage errors
      }
    }
  })();
  
  return _refreshPromise;
}

/**
 * Get current session, only refreshing if needed
 */
export async function getSessionWithRefresh(forceRefresh = false) {
  // For SSR, return empty session without error
  if (!isBrowser) {
    return emptyResponse;
  }
  
  // If we're forcing a refresh, do that
  if (forceRefresh) {
    return refreshSession();
  }
  
  try {
    // Check for null supabase client
    if (!supabase || !supabase.auth) {
      console.error('Supabase client not available during getSession');
      return emptyResponse;
    }
    
    // First get the current session without refreshing
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Error getting session:', error);
      return { data: { session: null }, error };
    }
    
    // If we don't have a session and can refresh, then refresh
    if (!data.session && canRefreshSession()) {
      return refreshSession();
    }
    
    // Otherwise return the current session data
    return { data, error: null };
  } catch (e) {
    console.error('Unexpected error getting session:', e);
    return { 
      data: { session: null }, 
      error: e 
    };
  }
}

/**
 * Check if session refresh is currently in progress
 */
export function isSessionRefreshInProgress(): boolean {
  if (!isBrowser || _isRefreshInProgress) return false;
  
  try {
    return localStorage.getItem(SESSION_REFRESH_IN_PROGRESS) === 'true';
  } catch (e) {
    return false;
  }
}

/**
 * Get milliseconds until next possible refresh
 */
export function getTimeUntilNextRefresh(): number {
  if (!isBrowser) return 0;
  
  try {
    const lastRefresh = _lastRefreshTime || parseInt(localStorage.getItem(SESSION_REFRESH_KEY) || '0', 10);
    const now = Date.now();
    const backoffTime = getBackoffTime();
    const timeLeft = backoffTime - (now - lastRefresh);
    
    return Math.max(0, timeLeft);
  } catch (e) {
    return 0;
  }
} 