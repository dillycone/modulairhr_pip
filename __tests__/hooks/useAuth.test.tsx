import { renderHook, act } from '@testing-library/react';
import { useAuth } from '@/hooks/useAuth';
import { AuthProviderWrapper, createMockAuthContext } from '../utils';
import * as supabaseModule from '@/lib/supabase';
import { createMockSupabaseClient } from '../mocks/supabase';

// Mock the supabase module
jest.mock('@/lib/supabase', () => ({
  supabase: null, // We'll set this in each test
}));

describe('useAuth hook', () => {
  let mockSupabase: ReturnType<typeof createMockSupabaseClient>;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Create a fresh mock supabase client for each test
    mockSupabase = createMockSupabaseClient({});
    // Apply the mock
    (supabaseModule as any).supabase = mockSupabase;
  });

  test('useAuth throws error when used outside AuthProvider', () => {
    // Suppress console.error for this test as we expect an error
    const originalError = console.error;
    console.error = jest.fn();
    
    expect(() => {
      const { result } = renderHook(() => useAuth());
    }).toThrow('useAuth must be used within an AuthProvider');
    
    // Restore console.error
    console.error = originalError;
  });

  test('useAuth returns the auth context when used within AuthProvider', () => {
    // Create mock context with specific values to verify
    const mockContext = createMockAuthContext({
      user: { id: 'test-id', email: 'test@example.com' } as any,
      loading: false,
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => (
        <AuthProviderWrapper contextValues={mockContext}>
          {children}
        </AuthProviderWrapper>
      ),
    });

    // Verify the hook returns the context we provided
    expect(result.current.user?.id).toBe('test-id');
    expect(result.current.user?.email).toBe('test@example.com');
    expect(result.current.loading).toBe(false);
    expect(result.current.signIn).toBeDefined();
    expect(result.current.signUp).toBeDefined();
    expect(result.current.signOut).toBeDefined();
    expect(result.current.resetPassword).toBeDefined();
    expect(result.current.updatePassword).toBeDefined();
  });

  test('signIn function is called with correct parameters', async () => {
    const mockSignIn = jest.fn().mockResolvedValue({
      data: { user: { id: 'user-1' }, session: { token: 'token-1' } },
      error: null,
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => (
        <AuthProviderWrapper 
          contextValues={{ signIn: mockSignIn }}
        >
          {children}
        </AuthProviderWrapper>
      ),
    });

    // Call the signIn function
    await act(async () => {
      await result.current.signIn({
        email: 'test@example.com',
        password: 'password123',
        rememberMe: true,
      });
    });

    // Verify signIn was called with correct params
    expect(mockSignIn).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
      rememberMe: true,
    });
  });

  test('signUp function is called with correct parameters', async () => {
    const mockSignUp = jest.fn().mockResolvedValue({
      data: { user: { id: 'new-user' } },
      error: null,
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => (
        <AuthProviderWrapper
          contextValues={{ signUp: mockSignUp }}
        >
          {children}
        </AuthProviderWrapper>
      ),
    });

    // Call the signUp function
    await act(async () => {
      await result.current.signUp('new@example.com', 'newPassword123');
    });

    // Verify signUp was called with correct params
    expect(mockSignUp).toHaveBeenCalledWith('new@example.com', 'newPassword123');
  });

  test('resetPassword function is called with correct parameters', async () => {
    const mockResetPassword = jest.fn().mockResolvedValue({
      data: {},
      error: null,
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => (
        <AuthProviderWrapper
          contextValues={{ resetPassword: mockResetPassword }}
        >
          {children}
        </AuthProviderWrapper>
      ),
    });

    // Call the resetPassword function
    await act(async () => {
      await result.current.resetPassword('reset@example.com');
    });

    // Verify resetPassword was called with correct email
    expect(mockResetPassword).toHaveBeenCalledWith('reset@example.com');
  });

  test('updatePassword function is called with correct parameters', async () => {
    const mockUpdatePassword = jest.fn().mockResolvedValue({
      data: { user: { id: 'user-1' } },
      error: null,
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => (
        <AuthProviderWrapper
          contextValues={{ updatePassword: mockUpdatePassword }}
        >
          {children}
        </AuthProviderWrapper>
      ),
    });

    // Call the updatePassword function
    await act(async () => {
      await result.current.updatePassword('newStrongPassword');
    });

    // Verify updatePassword was called with correct password
    expect(mockUpdatePassword).toHaveBeenCalledWith('newStrongPassword');
  });

  test('signOut function is called', async () => {
    const mockSignOut = jest.fn().mockResolvedValue({ error: null });

    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => (
        <AuthProviderWrapper
          contextValues={{ signOut: mockSignOut }}
        >
          {children}
        </AuthProviderWrapper>
      ),
    });

    // Call the signOut function
    await act(async () => {
      await result.current.signOut();
    });

    // Verify signOut was called
    expect(mockSignOut).toHaveBeenCalled();
  });
});