import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    // Check if Supabase environment variables are set to placeholders
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json({ 
        status: 'configuration_error',
        message: 'Supabase credentials not found',
        environmentVariables: {
          urlSet: !!supabaseUrl,
          keySet: !!supabaseAnonKey
        }
      }, { status: 500 });
    }

    // Check if they're placeholder values
    if (supabaseUrl === 'your-supabase-url' || supabaseAnonKey === 'your-supabase-anon-key') {
      return NextResponse.json({ 
        status: 'configuration_error',
        message: 'Supabase credentials are set to placeholder values',
        environmentVariables: {
          url: 'Placeholder value detected',
          key: 'Placeholder value detected'
        }
      }, { status: 500 });
    }

    try {
      // Validate URL format
      new URL(supabaseUrl);
    } catch (error) {
      return NextResponse.json({ 
        status: 'configuration_error',
        message: 'Supabase URL is not a valid URL',
        environmentVariables: {
          url: 'Invalid URL format'
        }
      }, { status: 500 });
    }

    // Try to get auth status (without requiring authentication)
    try {
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        return NextResponse.json({ 
          status: 'auth_error',
          message: error.message 
        }, { status: 500 });
      }
      
      return NextResponse.json({ 
        status: 'success',
        message: 'Supabase client initialized successfully',
        sessionExists: !!data.session,
        data: data
      });
    } catch (error: any) {
      return NextResponse.json({ 
        status: 'auth_error',
        message: error.message || 'Unknown error in auth API call'
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error('Auth test error:', error);
    return NextResponse.json({ 
      status: 'server_error',
      message: error.message || 'Unknown error occurred' 
    }, { status: 500 });
  }
} 