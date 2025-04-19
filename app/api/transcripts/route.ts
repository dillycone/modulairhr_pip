import { NextRequest, NextResponse } from 'next/server';
import type { Database } from '@/types/supabase';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { useMockData } from '@/lib/env';

// Required roles to access this endpoint
const REQUIRED_ROLES = ['admin', 'manager', 'hr_admin'] as const;

export async function GET(req: NextRequest) {
  try {
    // Initialize Supabase client that properly awaits cookies
    const supabase = await createServerSupabaseClient();

    // Check if user is authenticated
    const { data: { session }, error: authError } = await supabase.auth.getSession();

    if (authError || !session) {
      console.error('Authentication error:', authError);
      return NextResponse.json(
        { error: 'Unauthorized - Please login to access this endpoint' },
        { status: 401 }
      );
    }

    // Development environment check - bypass role verification in dev
    if (process.env.NODE_ENV === 'development') {
      console.log('Dev environment: bypassing role checks for development');
    } else {
      // Check user roles
      const userRoles = session.user.app_metadata?.roles as string[] | undefined || [];
      const canAccess = REQUIRED_ROLES.some(requiredRole => userRoles.includes(requiredRole));
      
      if (!canAccess) {
        return NextResponse.json(
          { error: 'Forbidden - Insufficient permissions' },
          { status: 403 }
        );
      }
    }

    // Get the user ID
    const userId = session.user.id;
    
    // Define mock transcript data in one place for consistency
    const getMockTranscripts = (userId: string) => [
      {
        id: '1',
        title: 'Performance Review - John Doe',
        date: '2025-03-15',
        duration: '00:45:30',
        speakers: 2,
        content: 'This is a transcript of a performance review meeting with John Doe.',
        user_id: userId,
        created_at: '2025-03-15T14:30:00Z',
      },
      {
        id: '2',
        title: 'Coaching Session - Jane Smith',
        date: '2025-03-10',
        duration: '00:32:15',
        speakers: 3,
        content: 'This is a transcript of a coaching session with Jane Smith.',
        user_id: userId,
        created_at: '2025-03-10T10:15:00Z',
      },
      {
        id: '3',
        title: 'Improvement Discussion - Alex Johnson',
        date: '2025-03-01',
        duration: '01:12:45',
        speakers: 2,
        content: 'This is a transcript of an improvement discussion with Alex Johnson.',
        user_id: userId,
        created_at: '2025-03-01T09:00:00Z',
      },
      {
        id: '4',
        title: 'Department Meeting - Q1 Review',
        date: '2025-02-25',
        duration: '01:30:00',
        speakers: 5,
        content: 'This is a transcript of a department meeting reviewing Q1 performance.',
        user_id: userId,
        created_at: '2025-02-25T15:45:00Z',
      }
    ];
    
    // Check if we should use mock data
    if (useMockData()) {
      console.log('Using mock transcript data instead of database query');
      return NextResponse.json({
        transcripts: getMockTranscripts(userId)
      });
    }
    
    // Otherwise, query real data from the database
    try {
      const { data: transcripts, error } = await supabase
        .from('transcripts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Database query error:', error);
        
        // For table doesn't exist errors, provide a clearer error message
        if (error.code === '42P01') {
          console.error('Transcripts table does not exist in the database');
          return NextResponse.json({
            error: 'Database schema missing required tables',
            details: 'The transcripts table has not been created in the database'
          }, { status: 500 });
        }
        
        return NextResponse.json({
          error: 'Failed to fetch transcripts',
          details: error.message
        }, { status: 500 });
      }
      
      return NextResponse.json({ transcripts });
      
    } catch (dbError) {
      console.error('Unhandled database error:', dbError);
      return NextResponse.json({
        error: 'Database error occurred',
        details: dbError instanceof Error ? dbError.message : 'Unknown error'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}