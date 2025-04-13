# Authentication Testing Suite

This directory contains tests for the authentication system, including unit tests for hooks, component tests for authentication UI components, and integration tests for authentication flows.

## Test Structure

```
__tests__/
  ├── auth-flow.test.tsx           # Integration tests for auth flows
  ├── edge-cases.test.tsx          # Tests for edge cases (expired tokens, network failures)
  ├── hooks/
  │   └── useAuth.test.tsx         # Unit tests for auth hook functions
  ├── components/
  │   └── auth/
  │       ├── auth-provider.test.tsx  # Tests for auth context provider
  │       └── login-form.test.tsx     # Tests for login form component
  └── mocks/
      └── supabase.ts              # Mock implementation of Supabase client
```

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm test -- --coverage
```

## Test Coverage

The tests cover the following areas:

1. **Authentication Hook Functions**
   - Hook initialization and error handling
   - Sign-in functionality
   - Sign-up functionality
   - Password reset and update
   - Sign-out functionality

2. **Auth Provider Context**
   - Session initialization
   - Auth state changes
   - Error mapping and handling
   - Cleanup on unmount

3. **Authentication Flows**
   - Login flow
   - Signup flow
   - Password reset flow
   - Session expiry handling

4. **Edge Cases**
   - Expired tokens
   - Network failures
   - Rate limiting
   - Invalid credentials
   - Unconfirmed emails

## Mocking Strategy

The tests use the following mocking strategy:

1. **Supabase Client**: A comprehensive mock implementation that simulates various success and error scenarios.

2. **Next.js Components**: Mocks for Next.js navigation functions using Jest mocks.

3. **Auth Context**: A custom test provider to isolate component tests from the Supabase client.

## To Do

- Add tests for remaining auth components (SignupForm, PasswordForm)
- Improve test coverage for edge cases
- Add e2e tests for complete auth flows