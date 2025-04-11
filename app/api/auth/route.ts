import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import type { Database } from '@/types/supabase';

// Custom email template configuration
const emailTemplates = {
  welcome: {
    subject: 'Welcome to DevPIP - Your PIP Management Solution',
    body: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Welcome to DevPIP</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background-color: #4f46e5;
      padding: 20px;
      color: white;
      border-radius: 5px 5px 0 0;
      text-align: center;
    }
    .content {
      padding: 20px;
      background-color: #f9fafb;
      border: 1px solid #e5e7eb;
      border-top: none;
      border-radius: 0 0 5px 5px;
    }
    .button {
      display: inline-block;
      background-color: #4f46e5;
      color: white;
      text-decoration: none;
      padding: 10px 20px;
      border-radius: 5px;
      margin: 20px 0;
      font-weight: bold;
    }
    .footer {
      margin-top: 20px;
      font-size: 0.8em;
      color: #6b7280;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Welcome to DevPIP</h1>
  </div>
  <div class="content">
    <p>Hello,</p>
    <p>Thank you for signing up for DevPIP, your complete solution for managing Performance Improvement Plans with ease.</p>
    <p>With DevPIP, you can:</p>
    <ul>
      <li>Create and manage PIPs using AI-assisted workflows</li>
      <li>Track employee progress effectively</li>
      <li>Access professional templates for various situations</li>
      <li>Generate comprehensive reports for stakeholders</li>
    </ul>
    <p>To get started, please verify your email by clicking the button below:</p>
    <div style="text-align: center;">
      <a href="{{ .ConfirmationURL }}" class="button">Verify Email Address</a>
    </div>
    <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
    <p>Best regards,<br>The DevPIP Team</p>
  </div>
  <div class="footer">
    <p>© 2025 DevPIP. All rights reserved.</p>
    <p>If you did not create this account, please ignore this email.</p>
  </div>
</body>
</html>
    `
  }
};

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  
  if (code) {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient<Database>({ 
      cookies: () => cookieStore,
      options: {
        auth: {
          flowType: 'pkce',
          cookieOptions: {
            name: 'devpip-auth',
            lifetime: 60 * 60 * 8, // 8 hours
            sameSite: 'lax',
            secure: true
          }
        }
      }
    });
    
    // Exchange the code for a session
    await supabase.auth.exchangeCodeForSession(code);
  }
  
  // URL to redirect to after sign in process completes
  const redirectTo = requestUrl.searchParams.get('redirect') || '/dashboard';
  
  return NextResponse.redirect(new URL(redirectTo, requestUrl.origin));
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient<Database>({ 
      cookies: () => cookieStore,
      options: {
        auth: {
          flowType: 'pkce',
          cookieOptions: {
            name: 'devpip-auth',
            lifetime: 60 * 60 * 8, // 8 hours
            sameSite: 'lax',
            secure: true
          }
        }
      } 
    });
    
    const body = await request.json();
    const { action, ...data } = body;
    
    // Handle different actions
    switch (action) {
      case 'sign-out':
        await supabase.auth.signOut();
        return NextResponse.json({ success: true });
      
      default:
        return NextResponse.json(
          { error: 'Unknown action' }, 
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Auth API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
} 