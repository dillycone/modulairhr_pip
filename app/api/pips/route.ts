import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { Database } from '@/types/supabase';

export async function GET() {
  try {
    // Create a Supabase client with server-side auth - IMPORTANT: await cookies()
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore });
    
    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in.' },
        { status: 401 }
      );
    }

    try {
      // Try the RPC function first (if available)
      const { data, error } = await supabase.rpc('get_user_pips', {
        user_id: user.id
      });
      
      if (error) {
        throw error;
      }
      
      return NextResponse.json({ data });
    } catch (rpcError) {
      console.log('RPC function not available or failed, falling back to direct query');
      
      // Fallback to direct query 
      const { data, error } = await supabase
        .from('pips')
        .select('*')
        .eq('created_by', user.id);
        
      if (error) {
        console.error('Error with direct query:', error);
        
        // Last resort fallback - use empty data
        // Check for role/permission related errors using error code or message pattern
        if (error.code === '42501' || // PostgreSQL permission denied error
            error.code === '3D000' || // Invalid database role error
            error.message?.match(/permission|role|privilege|access denied/i)) {
          console.log('Permission or role error detected, providing empty data set');
          return NextResponse.json({ data: [] });
        }
        
        return NextResponse.json(
          { error: `Failed to fetch PIPs: ${error.message}` },
          { status: 500 }
        );
      }
      
      return NextResponse.json({ data });
    }
  } catch (err: any) {
    console.error('Unhandled error in PIPs API:', err);
    return NextResponse.json(
      { error: `Server error: ${err.message}` },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    // Create a Supabase client with server-side auth - IMPORTANT: await cookies()
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore });
    
    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in.' },
        { status: 401 }
      );
    }

    // Parse request body
    const pipData = await request.json();
    
    // Make sure the created_by matches the current user's ID
    pipData.created_by = user.id;
    
    try {
      // Try RPC function first (if available)
      const { data, error } = await supabase.rpc('create_pip', {
        pip_data: pipData
      });
      
      if (error) {
        throw error;
      }
      
      return NextResponse.json({ data });
    } catch (rpcError) {
      console.log('RPC function not available or failed, falling back to direct insert');
      
      // Fallback to direct insert
      try {
        const { data, error } = await supabase
          .from('pips')
          .insert([pipData])
          .select();
        
        if (error) {
          throw error;
        }
        
        return NextResponse.json({ data });
      } catch (insertError: any) {
        console.error('Insert error:', insertError);
        
        return NextResponse.json(
          { error: `Failed to create PIP: ${insertError.message}` },
          { status: 500 }
        );
      }
    }
  } catch (err: any) {
    console.error('Unhandled error in PIPs API:', err);
    return NextResponse.json(
      { error: `Server error: ${err.message}` },
      { status: 500 }
    );
  }
} 