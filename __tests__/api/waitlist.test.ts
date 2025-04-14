/**
 * @jest-environment node
 */

import { NextRequest } from 'next/server';

// Mock Next.js Response
jest.mock('next/server', () => {
  const actual = jest.requireActual('next/server');
  return {
    ...actual,
    NextResponse: {
      ...actual.NextResponse,
      json: jest.fn().mockImplementation((data, init) => {
        const response = new actual.NextResponse(JSON.stringify(data), {
          ...init,
          status: init?.status || 200,
          headers: {
            'Content-Type': 'application/json',
            ...init?.headers,
          },
        });
        return response;
      }),
    },
  };
});

// Mock environment variables
process.env.RESEND_API_KEY = 'test-resend-key';
process.env.NOTIFICATION_EMAIL = 'admin@example.com';

describe('Waitlist API', () => {
  let POST: (req: Request) => Promise<Response>;
  let mockSend: jest.Mock;

  beforeEach(async () => {
    jest.resetModules();
    
    // Setup mock send function
    mockSend = jest.fn().mockResolvedValue({ id: 'mock-email-id' });
    
    // Setup Resend mock
    jest.doMock('resend', () => ({
      Resend: jest.fn().mockImplementation(() => ({
        emails: {
          send: mockSend
        }
      }))
    }));

    // Import the POST handler after mocking
    const route = await import('@/app/api/waitlist/route');
    POST = route.POST;
  });

  it('should successfully add email to waitlist and send notification', async () => {
    // Create mock request
    const mockRequest = new NextRequest('http://localhost:3000/api/waitlist', {
      method: 'POST',
      body: JSON.stringify({ email: 'test@example.com' }),
    });

    // Call the API endpoint
    const response = await POST(mockRequest);
    const data = await response.json();

    // Verify response
    expect(response.status).toBe(200);
    expect(data).toEqual({ message: 'Successfully joined waitlist' });

    // Verify email was sent with correct parameters
    expect(mockSend).toHaveBeenCalledWith({
      from: 'Waitlist <onboarding@resend.dev>',
      to: 'admin@example.com',
      subject: 'New Waitlist Signup!',
      text: 'New signup for the waitlist:\n\nEmail: test@example.com',
    });
  });

  it('should return 400 if email is missing', async () => {
    // Create mock request without email
    const mockRequest = new NextRequest('http://localhost:3000/api/waitlist', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    // Call the API endpoint
    const response = await POST(mockRequest);
    const data = await response.json();

    // Verify response
    expect(response.status).toBe(400);
    expect(data).toEqual({ error: 'Email is required' });

    // Verify no email was sent
    expect(mockSend).not.toHaveBeenCalled();
  });

  it('should return 500 if email sending fails', async () => {
    // Mock email sending failure
    mockSend.mockRejectedValueOnce(new Error('Failed to send email'));

    // Create mock request
    const mockRequest = new NextRequest('http://localhost:3000/api/waitlist', {
      method: 'POST',
      body: JSON.stringify({ email: 'test@example.com' }),
    });

    // Call the API endpoint
    const response = await POST(mockRequest);
    const data = await response.json();

    // Verify response
    expect(response.status).toBe(500);
    expect(data).toEqual({ error: 'Failed to join waitlist' });
  });
}); 