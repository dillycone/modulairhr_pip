'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

export default function LoginDebugPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Email and password are required');
      return;
    }

    setIsLoading(true);
    setError(null);
    setApiResponse(null);

    try {
      // Make the raw Supabase call
      console.log('Attempting login with:', { email, rememberMe });
      
      const response = await supabase.auth.signInWithPassword({
        email,
        password,
        options: {
          // The persistSession option needs to be in the options object
          // @ts-ignore - Ignoring type error until Supabase types are updated
          persistSession: rememberMe
        }
      });

      console.log('Login response:', response);
      
      // Store the raw response
      setApiResponse(response);
      
      if (response.error) {
        setError(`Authentication error: ${response.error.message}`);
      }
    } catch (err) {
      console.error('Login exception:', err);
      setError(`Exception during login: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">Login Debug Tool</h1>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Debug Login</CardTitle>
          <CardDescription>
            Test authentication with direct Supabase calls
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="rememberMe"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked === true)}
              />
              <Label htmlFor="rememberMe">Remember me</Label>
            </div>
            
            {error && (
              <div className="p-3 bg-red-100 text-red-800 rounded">
                {error}
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button
            onClick={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? 'Logging in...' : 'Test Login'}
          </Button>
        </CardFooter>
      </Card>

      {apiResponse && (
        <Card>
          <CardHeader>
            <CardTitle>Raw API Response</CardTitle>
            <CardDescription>
              The raw response from Supabase authentication
            </CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-96">
              {JSON.stringify(apiResponse, (key, value) => {
                // Don't display full token values for security
                if (key === 'access_token' || key === 'refresh_token') {
                  return value ? `${value.substring(0, 10)}...` : value;
                }
                return value;
              }, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 