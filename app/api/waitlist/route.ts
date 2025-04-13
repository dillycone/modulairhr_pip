import { Resend } from 'resend';
import { NextResponse } from 'next/server';
import { env } from '@/lib/env';

const resend = new Resend(env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Send notification email to you
    const result = await resend.emails.send({
      from: 'Waitlist <onboarding@resend.dev>',
      to: env.NOTIFICATION_EMAIL,
      subject: 'New Waitlist Signup!',
      text: `New signup for the waitlist:\n\nEmail: ${email}`,
    });
    
    console.log('Email sent to admin:', result);

    return NextResponse.json(
      { message: 'Successfully joined waitlist' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Waitlist error:', error);
    return NextResponse.json(
      { error: 'Failed to join waitlist' },
      { status: 500 }
    );
  }
} 