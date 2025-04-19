import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider } from '@/components/auth/auth-provider';
import { useAuth, AuthErrorCode } from '@/hooks/useAuth';
import * as supabaseModule from '@/lib/supabase';
import { createMockSupabaseClient, mockUser, mockSession } from '../../mocks/supabase';

// Mock the supabase module
jest.mock('@/lib/supabase', () => ({
  supabase: null, // We'll set this in each test
}));

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn().mockReturnValue({
    push: jest.fn(),
    refresh: jest.fn(),
  }),
  useSearchParams: jest.fn().mockReturnValue(new URLSearchParams()),
}));

// Mock the debug module to avoid console logs
jest.mock('@/lib/debug', () => ({
  debugLog: jest.fn(),
}));

// Create a test component that consumes the auth context
const TestComponent = () => {
  const auth = useAuth();
  return (
    <div>
      <div data-testid="loading">Loading: {String(auth.loading)}</div>
      <div data-testid="user-email">User: {auth.user?.email || 'no user'}</div>
      <div data-testid="error">Error: {auth.error?.message || 'no error'}</div>
      <div data-testid="error-code">Code: {auth.error?.code || 'no code'}</div>
      <button 
        data-testid="signin-btn" 
        onClick={() => auth.signIn({ email: 'test@example.com', password: 'password' })}
      >
        Sign In
      </button>
      <button
        data-testid="signup-btn"
        onClick={() => auth.signUp('new@example.com', 'newpassword')}
      >
        Sign Up
      </button>
      <button
        data-testid="signout-btn"
        onClick={() => auth.signOut()}
      >
        Sign Out
      </button>
       <button
        data-testid="resetpw-btn"
        onClick={() => auth.resetPassword('reset@example.com')}
      >
        Reset Password
      </button>
       <button
        data-testid="updatepw-btn"
        onClick={() => auth.updatePassword('updatedpassword')}
      >
        Update Password
      </button>
    </div>
  );
};

describe('AuthProvider', () => {
  let mockSupabase: ReturnType<typeof createMockSupabaseClient>;

  beforeEach(() => {
    // Reset mocks and create a fresh client for each test
    jest.clearAllMocks();
    mockSupabase = createMockSupabaseClient({}); // Default success behavior
    (supabaseModule as any).supabase = mockSupabase;
  });

  test('initial state is loading, then resolves session', async () => {
    mockSupabase = createMockSupabaseClient({ initialSession: mockSession });
    (supabaseModule as any).supabase = mockSupabase;

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Initially loading
    expect(screen.getByTestId('loading')).toHaveTextContent('Loading: true');

    // Wait for session check to complete
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('Loading: false');
      expect(screen.getByTestId('user-email')).toHaveTextContent(`User: ${mockUser.email}`);
      expect(screen.getByTestId('error')).toHaveTextContent('Error: no error');
    });

    expect(mockSupabase.auth.getSession).toHaveBeenCalledTimes(1);
    expect(mockSupabase.auth.onAuthStateChange).toHaveBeenCalledTimes(1);
  });

  test('handles sign in success', async () => {
     mockSupabase = createMockSupabaseClient({ initialSession: null }); // Start logged out
    (supabaseModule as any).supabase = mockSupabase;
    const user = userEvent.setup();

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Wait for initial load (no user)
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('Loading: false');
      expect(screen.getByTestId('user-email')).toHaveTextContent('User: no user');
    });

    // Click sign in button
    await act(async () => {
      await user.click(screen.getByTestId('signin-btn'));
    });

    // Wait for sign in process and state update
    await waitFor(() => {
      expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password',
        options: { persistSession: true } // Default behavior
      });
      // getSession is called again after successful signin to refresh
      expect(mockSupabase.auth.getSession).toHaveBeenCalledTimes(2);
      expect(screen.getByTestId('loading')).toHaveTextContent('Loading: false');
      // Assuming mock returns test@example.com on successful signin
      expect(screen.getByTestId('user-email')).toHaveTextContent('User: test@example.com');
      expect(screen.getByTestId('error')).toHaveTextContent('Error: no error');
    });
  });

  test('handles sign in failure (invalid credentials)', async () => {
    mockSupabase = createMockSupabaseClient({
      initialSession: null,
      shouldSucceed: { signIn: false },
      errorCases: {
        signInError: { message: 'Invalid login credentials', code: AuthErrorCode.SIGNIN_INVALID_CREDENTIALS }
      }
    });
    (supabaseModule as any).supabase = mockSupabase;
    const user = userEvent.setup();

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('Loading: false'));

    await act(async () => {
      await user.click(screen.getByTestId('signin-btn'));
    });

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('Loading: false');
      expect(screen.getByTestId('user-email')).toHaveTextContent('User: no user');
      expect(screen.getByTestId('error')).toHaveTextContent('Error: The email or password you entered is incorrect');
      expect(screen.getByTestId('error-code')).toHaveTextContent(`Code: ${AuthErrorCode.SIGNIN_INVALID_CREDENTIALS}`);
    });
  });

  test('handles sign out success', async () => {
    mockSupabase = createMockSupabaseClient({ initialSession: mockSession }); // Start logged in
    (supabaseModule as any).supabase = mockSupabase;
    const user = userEvent.setup();

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Wait for initial load (user logged in)
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('Loading: false');
      expect(screen.getByTestId('user-email')).toHaveTextContent(`User: ${mockUser.email}`);
    });

    // Click sign out button
    await act(async () => {
      await user.click(screen.getByTestId('signout-btn'));
    });

    // Wait for sign out process and state update
    await waitFor(() => {
      expect(mockSupabase.auth.signOut).toHaveBeenCalledTimes(1);
      expect(screen.getByTestId('loading')).toHaveTextContent('Loading: false');
      expect(screen.getByTestId('user-email')).toHaveTextContent('User: no user');
      expect(screen.getByTestId('error')).toHaveTextContent('Error: no error');
    });
  });

  test('handles sign up success (requires confirmation)', async () => {
    mockSupabase = createMockSupabaseClient({ initialSession: null });
    (supabaseModule as any).supabase = mockSupabase;
    const user = userEvent.setup();

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('Loading: false'));

    await act(async () => {
      await user.click(screen.getByTestId('signup-btn'));
    });

    await waitFor(() => {
      expect(mockSupabase.auth.signUp).toHaveBeenCalledWith({
        email: 'new@example.com',
        password: 'newpassword',
        options: expect.objectContaining({
          emailRedirectTo: expect.stringContaining('/auth/callback'),
        }),
      });
      expect(screen.getByTestId('loading')).toHaveTextContent('Loading: false');
      // Sign up usually returns the user but no session until confirmation
      expect(screen.getByTestId('user-email')).toHaveTextContent('User: new@example.com');
      expect(screen.getByTestId('error')).toHaveTextContent('Error: no error');
    });
  });

   test('handles password reset request success', async () => {
    mockSupabase = createMockSupabaseClient({ initialSession: null });
    (supabaseModule as any).supabase = mockSupabase;
    const user = userEvent.setup();

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('Loading: false'));

    await act(async () => {
      await user.click(screen.getByTestId('resetpw-btn'));
    });

    await waitFor(() => {
      expect(mockSupabase.auth.resetPasswordForEmail).toHaveBeenCalledWith(
        'reset@example.com',
        expect.objectContaining({
          redirectTo: expect.stringContaining('/auth/update-password'),
        })
      );
      expect(screen.getByTestId('loading')).toHaveTextContent('Loading: false');
      expect(screen.getByTestId('error')).toHaveTextContent('Error: no error');
    });
  });

   test('handles password update success', async () => {
    // Need to simulate being logged in (e.g., after clicking reset link)
    mockSupabase = createMockSupabaseClient({ initialSession: mockSession });
    (supabaseModule as any).supabase = mockSupabase;
    const user = userEvent.setup();

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('Loading: false'));

    await act(async () => {
      await user.click(screen.getByTestId('updatepw-btn'));
    });

    await waitFor(() => {
      expect(mockSupabase.auth.updateUser).toHaveBeenCalledWith({ password: 'updatedpassword' });
      // getSession called again after update
      expect(mockSupabase.auth.getSession).toHaveBeenCalledTimes(2);
      expect(screen.getByTestId('loading')).toHaveTextContent('Loading: false');
      expect(screen.getByTestId('error')).toHaveTextContent('Error: no error');
      // User email should remain the same
      expect(screen.getByTestId('user-email')).toHaveTextContent(`User: ${mockUser.email}`);
    });
  });

  test('handles session initialization error', async () => {
    mockSupabase = createMockSupabaseClient({
      initialSession: null,
      shouldSucceed: { getSession: false },
      errorCases: { getSessionError: { message: 'Session fetch failed', code: 'session_error' } }
    });
    (supabaseModule as any).supabase = mockSupabase;

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('Loading: false');
      expect(screen.getByTestId('user-email')).toHaveTextContent('User: no user');
      expect(screen.getByTestId('error')).toHaveTextContent('Error: Session fetch failed');
      expect(screen.getByTestId('error-code')).toHaveTextContent(`Code: ${AuthErrorCode.SESSION_INIT_FAILED}`);
    });
  });

});