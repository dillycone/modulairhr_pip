import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import type { Database } from '@/types/supabase';
import { isUserAdmin } from '@/lib/utils/is-admin';
import { isDebugEnabled } from '@/lib/env';

export async function GET() {
  // Only allow access in development mode
  if (!isDebugEnabled()) {
    return NextResponse.json({
      status: 'error',
      message: 'Debug endpoints are only available in development mode'
    }, { status: 403 });
  }
  
  try {
    console.log("Auth debug endpoint called");
    
    // Use the route handler client for API routes
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore });
    console.log("Supabase client created");
    
    // Get session first
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !sessionData.session) {
      console.error("Session error:", sessionError || "No active session");
      return NextResponse.json({
        status: 'error',
        message: 'No active session found',
        error: sessionError?.message || 'Missing session'
      }, { status: 401 });
    }
    
    // Get user data
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError || !userData.user) {
      console.error("User error:", userError || "No user found");
      return NextResponse.json({
        status: 'error',
        message: 'No authenticated user found despite session',
        error: userError?.message
      }, { status: 401 });
    }
    
    const { user } = userData;
    
    // Get user profile
    const { data: userProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select('organization_id, role')
      .eq('user_id', user.id)
      .single();
    
    // Check for admin role using standardized function
    const isAdmin = isUserAdmin(user);
    
    // Success response
    return NextResponse.json({
      status: 'success',
      session: {
        exists: true,
        expiresAt: sessionData.session.expires_at
      },
      user: {
        id: user.id,
        email: user.email,
        app_metadata: user.app_metadata,
        user_metadata: user.user_metadata
      },
      userProfile: userProfile || null,
      profileError: profileError?.message,
      isAdmin,
      developmentMode: process.env.NODE_ENV === 'development',
      // Show where roles are being read from for debugging
      roleSource: {
        app_metadata_roles: user.app_metadata?.roles,
        app_metadata_role: user.app_metadata?.role,
        user_metadata_role: user.user_metadata?.role,
        userProfile_role: userProfile?.role
      }
    });
    
  } catch (error: any) {
    console.error("Auth debug error:", error);
    return NextResponse.json({
      status: 'error',
      message: 'Error checking auth status',
      error: error.message
    }, { status: 500 });
  }
}