import { NextResponse } from 'next/server';

export async function GET() {
  console.log('ENV TEST - Checking environment variables:');
  console.log('- NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'present' : 'missing');
  console.log('- NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'present' : 'missing');
  console.log('- GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? 'present' : 'missing');
  console.log('- MOCK_DATA_ENABLED:', process.env.MOCK_DATA_ENABLED || 'not set');
  
  // Import the helper function for mock data check
  const { useMockData } = require('@/lib/env');
  const isMockDataEnabled = useMockData();
  
  return NextResponse.json({ 
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'configured' : 'missing',
    supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'configured' : 'missing',
    geminiKey: process.env.GEMINI_API_KEY ? 'configured' : 'missing',
    mockDataFlag: process.env.MOCK_DATA_ENABLED || 'not set',
    mockDataEnabled: isMockDataEnabled ? 'ENABLED - Using mock data' : 'disabled',
    nodeEnv: process.env.NODE_ENV || 'not set',
  });
} 