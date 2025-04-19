import { useState, useEffect, useCallback } from 'react';

interface RateLimitState {
  lastAttemptTimestamp: number | null;
}

export function useClientRateLimit(key: string, windowMs: number) {
  const [state, setState] = useState<RateLimitState>({
    lastAttemptTimestamp: null,
  });

  // Load state from localStorage on mount
  useEffect(() => {
    try {
      const storedState = localStorage.getItem(`rateLimit:${key}`);
      if (storedState) {
        setState(JSON.parse(storedState));
      }
    } catch (e) {
      console.warn(`Failed to load rate limit state for ${key}:`, e);
    }
  }, [key]);

  // Check if an action can be performed based on rate limits
  const canPerform = useCallback(() => {
    const { lastAttemptTimestamp } = state;
    
    if (!lastAttemptTimestamp) {
      return true;
    }
    
    const now = Date.now();
    return (now - lastAttemptTimestamp) > windowMs;
  }, [state, windowMs]);

  // Record an attempt
  const recordAttempt = useCallback(() => {
    const newState = {
      lastAttemptTimestamp: Date.now(),
    };
    
    // Update state
    setState(newState);
    
    // Persist to localStorage
    try {
      localStorage.setItem(`rateLimit:${key}`, JSON.stringify(newState));
    } catch (e) {
      console.warn(`Failed to save rate limit state for ${key}:`, e);
    }
  }, [key]);

  // Get remaining time until next allowed attempt
  const getRemainingTime = useCallback(() => {
    const { lastAttemptTimestamp } = state;
    
    if (!lastAttemptTimestamp) {
      return 0;
    }
    
    const now = Date.now();
    const elapsed = now - lastAttemptTimestamp;
    return Math.max(0, windowMs - elapsed);
  }, [state, windowMs]);

  return {
    canPerform,
    recordAttempt,
    getRemainingTime,
  };
}