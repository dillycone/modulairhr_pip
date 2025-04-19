'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw, CheckCircle, XCircle, Clock } from 'lucide-react';

// Rate limit constants
const REFRESH_COOLDOWN_KEY = 'session_refresh_cooldown';
const REFRESH_COOLDOWN_DURATION = 5 * 60 * 1000; // 5 minutes

export default function SessionRefreshButton() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error' | 'rate-limited'>('idle');
  const [message, setMessage] = useState<string | null>(null);
  const [cooldownRemaining, setCooldownRemaining] = useState<number>(0);
  const [cooldownInterval, setCooldownInterval] = useState<NodeJS.Timeout | null>(null);

  // Check for existing cooldown on component mount
  useEffect(() => {
    checkCooldown();
    
    // Set up timer to check cooldown every second
    const interval = setInterval(checkCooldown, 1000);
    setCooldownInterval(interval);
    
    return () => {
      if (cooldownInterval) clearInterval(cooldownInterval);
    };
  }, []);

  // Helper function to check cooldown status
  const checkCooldown = () => {
    try {
      const cooldownEndTime = localStorage.getItem(REFRESH_COOLDOWN_KEY);
      if (cooldownEndTime) {
        const endTime = parseInt(cooldownEndTime, 10);
        const now = Date.now();
        
        if (now < endTime) {
          // Still in cooldown
          setCooldownRemaining(Math.ceil((endTime - now) / 1000));
          setStatus('rate-limited');
          setMessage(`Please wait ${Math.ceil((endTime - now) / 1000)}s before refreshing again`);
        } else {
          // Cooldown expired
          localStorage.removeItem(REFRESH_COOLDOWN_KEY);
          setCooldownRemaining(0);
          setStatus('idle');
          setMessage(null);
        }
      } else {
        setCooldownRemaining(0);
      }
    } catch (e) {
      console.warn('Error checking cooldown', e);
    }
  };

  // Set the cooldown timer
  const setCooldown = (seconds: number = 300) => {
    try {
      const now = Date.now();
      const cooldownEnd = now + (seconds * 1000);
      localStorage.setItem(REFRESH_COOLDOWN_KEY, cooldownEnd.toString());
      setCooldownRemaining(seconds);
      setStatus('rate-limited');
    } catch (e) {
      console.warn('Error setting cooldown', e);
    }
  };

  const refreshSession = async () => {
    // Don't try to refresh if already in cooldown
    if (cooldownRemaining > 0) {
      return;
    }
    
    setIsRefreshing(true);
    setStatus('idle');
    setMessage(null);
    
    try {
      // Set a longer cooldown preemptively to prevent multiple clicks
      // while the request is in flight
      setCooldown(30); // 30 second initial cooldown
      
      const response = await fetch('/api/auth/session-fix');
      const data = await response.json();
      
      if (data.success) {
        setStatus('success');
        setMessage('Session refreshed successfully');
        
        // Apply a shorter cooldown on success to prevent immediate re-clicks
        setCooldown(60); // 1 minute cooldown on success
        
        // Reload the page after a short delay to apply the new session
        setTimeout(() => {
          try {
            // Clear any error indicators in localStorage before reload
            localStorage.setItem('session_refresh_errors', '0');
            window.location.reload();
          } catch (e) {
            console.warn('Error clearing session error count', e);
            window.location.reload();
          }
        }, 1000);
      } else {
        // Handle rate limiting
        if (response.status === 429 || data.rateLimited) {
          setStatus('rate-limited');
          const retryAfterSeconds = data.retryAfterSeconds || 300; // Default 5 min
          setCooldown(retryAfterSeconds);
          setMessage(`Rate limited: Please try again in ${retryAfterSeconds} seconds`);
        } else {
          setStatus('error');
          // Set appropriate cooldown for error case to prevent hammering
          setCooldown(60); // 1 minute cooldown on error
          
          // Display more specific error messages
          if (data.needsLogin) {
            setMessage('Your session has expired. Please log in again.');
            // Redirect to login after a short delay if session is invalid
            setTimeout(() => {
              const currentPath = window.location.pathname;
              window.location.href = `/auth/login?redirect=${encodeURIComponent(currentPath)}`;
            }, 2000);
          } else if (data.error) {
            setMessage(`${data.message}: ${data.error}`);
          } else {
            setMessage(data.message || 'Failed to refresh session');
          }
        }
      }
    } catch (err: any) {
      setStatus('error');
      setMessage('Network error. Please check your connection and try again.');
      // Set cooldown on network error too
      setCooldown(60); // 1 minute cooldown on error
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="space-y-2">
      <Button 
        onClick={refreshSession} 
        disabled={isRefreshing || cooldownRemaining > 0}
        className="w-full"
        variant={
          status === 'error' ? 'destructive' : 
          status === 'rate-limited' ? 'outline' : 
          'default'
        }
      >
        {isRefreshing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Refreshing...
          </>
        ) : status === 'success' ? (
          <>
            <CheckCircle className="mr-2 h-4 w-4" />
            Session Refreshed
          </>
        ) : status === 'error' ? (
          <>
            <XCircle className="mr-2 h-4 w-4" />
            Refresh Failed
          </>
        ) : status === 'rate-limited' ? (
          <>
            <Clock className="mr-2 h-4 w-4" />
            Wait ({cooldownRemaining}s)
          </>
        ) : (
          <>
            <RefreshCw className="mr-2 h-4 w-4" />
            Fix Session
          </>
        )}
      </Button>
      
      {message && (
        <p className={`text-sm ${
          status === 'error' ? 'text-red-500' : 
          status === 'rate-limited' ? 'text-amber-500' : 
          'text-green-500'
        }`}>
          {message}
        </p>
      )}
    </div>
  );
} 