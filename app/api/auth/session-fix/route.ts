import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/supabase';

export async function GET() {
  try {
    // Use the route handler client which is designed for API routes
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore });
    
    // Get the current session
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      return NextResponse.json({
        success: false,
        message: 'Error checking session',
        error: error.message
      }, { status: 500 });
    }
    
    if (!session) {
      return NextResponse.json({
        success: false,
        message: 'No active session found',
        needsLogin: true
      }, { status: 401 });
    }
    
    // Refresh the session
    const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
    
    if (refreshError) {
      return NextResponse.json({
        success: false,
        message: 'Failed to refresh session',
        error: refreshError.message
      }, { status: 500 });
    }
    
    // Return success with user info
    return NextResponse.json({
      success: true,
      message: 'Session refreshed successfully',
      user: {
        id: refreshData.user?.id,
        email: refreshData.user?.email,
        role: refreshData.user?.app_metadata?.role || 'user'
      }
    });
    
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: 'Server error',
      error: error.message
    }, { status: 500 });
  }
} 