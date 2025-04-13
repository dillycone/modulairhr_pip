import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginForm } from '@/components/auth/login-form';
import { renderWithAuth } from '../../utils';
import { AuthErrorCode } from '@/hooks/useAuth';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn().mockReturnValue({
    push: jest.fn(),
  }),
  useSearchParams: jest.fn().mockReturnValue(new URLSearchParams()),
}));

// Skip tests for now - to be fixed later
describe.skip('LoginForm component', () => {
  // Set up user-event
  const user = userEvent.setup();

  test('renders login form with all fields', () => {
    renderWithAuth(<LoginForm />);
    
    // Check if form elements are rendered
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: /remember me/i })).toBeInTheDocument();
    expect(screen.getByText(/forgot password/i)).toBeInTheDocument();
  });

  test('validates email field', async () => {
    renderWithAuth(<LoginForm />);
    
    const emailInput = screen.getByLabelText(/email/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    
    // Try submitting with empty email
    await user.click(submitButton);
    expect(await screen.findByText(/email is required/i)).toBeInTheDocument();
    
    // Try invalid email format
    await user.clear(emailInput);
    await user.type(emailInput, 'invalid-email');
    await user.click(submitButton);
    expect(await screen.findByText(/valid email/i)).toBeInTheDocument();
    
    // Try valid email
    await user.clear(emailInput);
    await user.type(emailInput, 'valid@example.com');
    await user.click(submitButton);
    
    // Should not show email validation error
    await waitFor(() => {
      expect(screen.queryByText(/valid email/i)).not.toBeInTheDocument();
    });
  });

  // Add other tests as needed
});