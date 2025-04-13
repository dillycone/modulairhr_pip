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
    
    // Standardize field names with unified schema regardless of source flow (template or transcript)
    const standardizedPipData = {
      ...pipData,
      // Basic employee fields
      employee_name: pipData.employee_name || pipData.employeeName,
      position: pipData.position || pipData.employeePosition,
      department: pipData.department,
      manager_name: pipData.manager_name || pipData.manager || pipData.managerName,
      
      // Date fields
      start_date: pipData.start_date || (pipData.startDate ? new Date(pipData.startDate).toISOString().slice(0, 10) : null),
      end_date: pipData.end_date || (pipData.endDate ? new Date(pipData.endDate).toISOString().slice(0, 10) : null),
      review_date: pipData.review_date || (pipData.reviewDate ? new Date(pipData.reviewDate).toISOString().slice(0, 10) : null),
      
      // Template flow fields
      objectives: pipData.objectives,
      improvements_needed: pipData.improvements_needed || pipData.improvementsNeeded,
      success_metrics: pipData.success_metrics || pipData.successMetrics,
      generated_content: pipData.generated_content || pipData.generatedContent,
      
      // Transcript flow fields
      performance_issues: pipData.performance_issues || pipData.performanceIssues,
      improvement_goals: pipData.improvement_goals || pipData.improvementGoals,
      resources_support: pipData.resources_support || pipData.resourcesSupport,
      consequences: pipData.consequences,
      
      // Transcript data
      transcript_data: pipData.transcript_data,
      transcript_summary: pipData.transcript_summary,
      
      // Common fields
      created_by: user.id,
      status: pipData.status || 'draft',
    };
    
    // Clean up any remaining camelCase duplicates
    delete standardizedPipData.employeeName;
    delete standardizedPipData.employeePosition;
    delete standardizedPipData.managerName;
    delete standardizedPipData.manager;
    delete standardizedPipData.startDate;
    delete standardizedPipData.endDate;
    delete standardizedPipData.reviewDate;
    delete standardizedPipData.performanceIssues;
    delete standardizedPipData.improvementGoals;
    delete standardizedPipData.resourcesSupport;
    delete standardizedPipData.improvementsNeeded;
    delete standardizedPipData.successMetrics;
    delete standardizedPipData.generatedContent;
    
    try {
      // Try RPC function first (if available)
      const { data, error } = await supabase.rpc('create_pip', {
        pip_data: standardizedPipData
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
          .insert([standardizedPipData])
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