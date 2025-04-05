import { NextResponse } from 'next/server';

export async function GET() {
  console.log('ENV TEST - Checking environment variables:');
  console.log('- NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'present' : 'missing');
  console.log('- NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'present' : 'missing');
  console.log('- GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? 'present' : 'missing');
  
  return NextResponse.json({ 
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'configured' : 'missing',
    supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'configured' : 'missing',
    geminiKey: process.env.GEMINI_API_KEY ? 'configured' : 'missing',
    nodeEnv: process.env.NODE_ENV || 'not set',
  });
} 