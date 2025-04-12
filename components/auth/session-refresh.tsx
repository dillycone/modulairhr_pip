'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw, CheckCircle, XCircle } from 'lucide-react';

export default function SessionRefreshButton() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState<string | null>(null);

  const refreshSession = async () => {
    setIsRefreshing(true);
    setStatus('idle');
    setMessage(null);
    
    try {
      const response = await fetch('/api/auth/session-fix');
      const data = await response.json();
      
      if (data.success) {
        setStatus('success');
        setMessage('Session refreshed successfully');
        // Reload the page to apply the new session
        setTimeout(() => window.location.reload(), 1000);
      } else {
        setStatus('error');
        // Display more specific error messages
        if (data.needsLogin) {
          setMessage('Your session has expired. Please log in again.');
        } else if (data.error) {
          setMessage(`${data.message}: ${data.error}`);
        } else {
          setMessage(data.message || 'Failed to refresh session');
        }
      }
    } catch (err: any) {
      setStatus('error');
      setMessage('Network error. Please check your connection and try again.');
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="space-y-2">
      <Button 
        onClick={refreshSession} 
        disabled={isRefreshing}
        className="w-full"
        variant={status === 'error' ? 'destructive' : 'default'}
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
        ) : (
          <>
            <RefreshCw className="mr-2 h-4 w-4" />
            Fix Session
          </>
        )}
      </Button>
      
      {message && (
        <p className={`text-sm ${status === 'error' ? 'text-red-500' : 'text-green-500'}`}>
          {message}
        </p>
      )}
    </div>
  );
} 