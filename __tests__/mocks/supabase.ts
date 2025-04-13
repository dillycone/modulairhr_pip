import { AuthErrorCode } from '@/hooks/useAuth';

// Mock user data
export const mockUser = {
  id: 'mock-user-id',
  email: 'test@example.com',
  app_metadata: {},
  user_metadata: {},
  aud: 'authenticated',
  created_at: new Date().toISOString(),
};

// Mock session data
export const mockSession = {
  access_token: 'mock-access-token',
  refresh_token: 'mock-refresh-token',
  expires_in: 3600,
  expires_at: Math.floor(Date.now() / 1000) + 3600,
  user: mockUser,
};

// Create mock supabase client with jest functions
export const createMockSupabaseClient = (options: {
  initialSession?: typeof mockSession | null;
  shouldSucceed?: {
    getSession?: boolean;
    signIn?: boolean;
    signUp?: boolean;
    signOut?: boolean;
    resetPassword?: boolean;
    updatePassword?: boolean;
  };
  errorCases?: {
    getSessionError?: { message: string; code?: string };
    signInError?: { message: string; code?: string };
    signUpError?: { message: string; code?: string };
    signOutError?: { message: string; code?: string };
    resetPasswordError?: { message: string; code?: string };
    updatePasswordError?: { message: string; code?: string };
    networkError?: boolean;
    expiredToken?: boolean;
  };
}) => {
  const {
    initialSession = mockSession,
    shouldSucceed = {
      getSession: true,
      signIn: true,
      signUp: true,
      signOut: true,
      resetPassword: true,
      updatePassword: true,
    },
    errorCases = {},
  } = options;

  // Set up auth state tracking
  let currentSession = initialSession;
  let currentUser = initialSession?.user || null;
  
  // Event handler tracking
  const authStateChangeHandlers: Array<(event: string, session: any) => void> = [];
  
  // Create the mock client
  return {
    auth: {
      getSession: jest.fn().mockImplementation(async () => {
        if (errorCases.networkError) {
          throw new Error('Network error');
        }
        
        if (errorCases.expiredToken) {
          currentSession = null;
          currentUser = null;
          return {
            data: { session: null },
            error: { message: 'JWT expired', code: 'token_expired' },
          };
        }

        if (!shouldSucceed.getSession) {
          return {
            data: { session: null },
            error: errorCases.getSessionError || { message: 'Error fetching session' },
          };
        }

        return {
          data: { session: currentSession },
          error: null,
        };
      }),

      signInWithPassword: jest.fn().mockImplementation(async ({ email, password }) => {
        if (errorCases.networkError) {
          throw new Error('Network error');
        }

        if (!shouldSucceed.signIn) {
          // Simulate different error cases
          if (email === 'rate-limited@example.com') {
            return {
              data: null,
              error: { message: 'Too many requests. Try again later', code: 'rate_limit_exceeded' },
            };
          } 
          if (email === 'unconfirmed@example.com') {
            return {
              data: null, 
              error: { message: 'Email not confirmed', code: 'email_not_confirmed', email },
            };
          }
          
          return {
            data: null,
            error: errorCases.signInError || { 
              message: 'Invalid login credentials', 
              code: 'invalid_credentials',
              email,
            },
          };
        }

        // Successful sign in
        currentUser = { ...mockUser, email };
        currentSession = { ...mockSession, user: currentUser };
        
        // Trigger auth state change
        setTimeout(() => {
          authStateChangeHandlers.forEach(handler => 
            handler('SIGNED_IN', currentSession)
          );
        }, 0);

        return {
          data: {
            user: currentUser,
            session: currentSession,
          },
          error: null,
        };
      }),

      signUp: jest.fn().mockImplementation(async ({ email, password }) => {
        if (errorCases.networkError) {
          throw new Error('Network error');
        }

        if (!shouldSucceed.signUp) {
          // Simulate different error cases
          if (email === 'existing@example.com') {
            return {
              data: { user: null, session: null },
              error: { 
                message: 'User already registered', 
                code: 'user_already_registered',
                email,
              },
            };
          }
          
          if (email === 'invalid@') {
            return {
              data: { user: null, session: null },
              error: { 
                message: 'Email is not valid', 
                code: 'invalid_email',
                email,
              },
            };
          }
          
          if (password === 'weak') {
            return {
              data: { user: null, session: null },
              error: { 
                message: 'Password not strong enough', 
                code: 'weak_password',
              },
            };
          }
          
          return {
            data: { user: null, session: null },
            error: errorCases.signUpError || { message: 'Signup error' },
          };
        }

        // For most signup flows, user needs to confirm email
        // Return user but no session
        const newUser = { ...mockUser, email };
        
        // Normally there would be no session until email confirmation
        return {
          data: {
            user: newUser,
            session: null, // No session until email confirmation
          },
          error: null,
        };
      }),

      signOut: jest.fn().mockImplementation(async () => {
        if (errorCases.networkError) {
          throw new Error('Network error');
        }

        if (!shouldSucceed.signOut) {
          return {
            error: errorCases.signOutError || { message: 'Error signing out' },
          };
        }

        // Clear state
        currentUser = null;
        currentSession = null;
        
        // Trigger auth state change
        setTimeout(() => {
          authStateChangeHandlers.forEach(handler => 
            handler('SIGNED_OUT', null)
          );
        }, 0);

        return { error: null };
      }),

      resetPasswordForEmail: jest.fn().mockImplementation(async (email, options) => {
        if (errorCases.networkError) {
          throw new Error('Network error');
        }

        if (!shouldSucceed.resetPassword) {
          return {
            data: null,
            error: errorCases.resetPasswordError || { 
              message: 'Password reset failed', 
              email,
            },
          };
        }

        return {
          data: {},
          error: null,
        };
      }),

      updateUser: jest.fn().mockImplementation(async ({ password }) => {
        if (errorCases.networkError) {
          throw new Error('Network error');
        }

        if (!shouldSucceed.updatePassword) {
          return {
            data: null,
            error: errorCases.updatePasswordError || { message: 'Password update failed' },
          };
        }

        // Update the user
        if (!currentUser) {
          return {
            data: null,
            error: { message: 'No active session', code: 'no_session' },
          };
        }

        // Simulate a token refresh
        setTimeout(() => {
          authStateChangeHandlers.forEach(handler => 
            handler('TOKEN_REFRESHED', currentSession)
          );
        }, 0);

        return {
          data: { user: currentUser },
          error: null,
        };
      }),

      onAuthStateChange: jest.fn().mockImplementation((callback) => {
        authStateChangeHandlers.push(callback);
        
        // Return an object with unsubscribe method
        return {
          data: {
            subscription: {
              unsubscribe: jest.fn(() => {
                const index = authStateChangeHandlers.indexOf(callback);
                if (index > -1) {
                  authStateChangeHandlers.splice(index, 1);
                }
              }),
            },
          },
        };
      }),
    },
  };
};