import React, { ReactNode } from 'react';
import { render } from '@testing-library/react';
import { AuthContext, AuthContextType } from '@/hooks/useAuth';
import { mockUser, mockSession } from './mocks/supabase';

// Create default mock auth context values
export const createMockAuthContext = (overrides?: Partial<AuthContextType>): AuthContextType => ({
  user: mockUser,
  session: mockSession,
  loading: false,
  error: null,
  signIn: jest.fn().mockResolvedValue({ data: { user: mockUser, session: mockSession }, error: null }),
  signUp: jest.fn().mockResolvedValue({ data: { user: mockUser, session: mockSession }, error: null }),
  signOut: jest.fn().mockResolvedValue({ error: null }),
  resetPassword: jest.fn().mockResolvedValue({ data: {}, error: null }),
  updatePassword: jest.fn().mockResolvedValue({ data: { user: mockUser }, error: null }),
  ...overrides,
});

// Custom render with auth context
export function renderWithAuth(
  ui: React.ReactElement,
  contextValues?: Partial<AuthContextType>
) {
  const mockContext = createMockAuthContext(contextValues);
  
  return render(
    <AuthContext.Provider value={mockContext}>
      {ui}
    </AuthContext.Provider>
  );
}

// Create a wrapper component for passing to testing-library's render
export function AuthProviderWrapper({ 
  children,
  contextValues,
}: {
  children: ReactNode;
  contextValues?: Partial<AuthContextType>;
}) {
  const mockContext = createMockAuthContext(contextValues);
  return <AuthContext.Provider value={mockContext}>{children}</AuthContext.Provider>;
}