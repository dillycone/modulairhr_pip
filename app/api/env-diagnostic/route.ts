import { NextResponse } from 'next/server';
import { env } from '@/lib/env';
import * as fs from 'fs';
import * as path from 'path';

export async function GET() {
  // Check process.env directly
  const directEnvCheck = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'present' : 'missing',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'present' : 'missing',
    GEMINI_API_KEY: process.env.GEMINI_API_KEY ? 'present' : 'missing',
  };
  
  // Check via env module
  const moduleEnvCheck = {
    NEXT_PUBLIC_SUPABASE_URL: env.NEXT_PUBLIC_SUPABASE_URL ? 'present' : 'missing',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'present' : 'missing',
    GEMINI_API_KEY: env.GEMINI_API_KEY ? 'present' : 'missing',
  };
  
  // Check for .env file existence
  let envFileCheck: {
    exists: boolean;
    contents: string[] | null;
    error?: string;
  } = { 
    exists: false, 
    contents: null 
  };
  
  try {
    const envPath = path.join(process.cwd(), '.env.local');
    const exists = fs.existsSync(envPath);
    
    if (exists) {
      const fileContents = fs.readFileSync(envPath, 'utf8')
        .split('\n')
        .map(line => {
          const parts = line.split('=');
          if (parts.length >= 2 && !line.startsWith('#')) {
            const key = parts[0];
            const value = parts.slice(1).join('=');
            return key && value ? `${key}=${value.substring(0, 5)}...` : line;
          }
          return line;
        })
        .filter(line => line.trim() && !line.startsWith('#'));
        
      envFileCheck = {
        exists,
        contents: fileContents
      };
    }
  } catch (error: any) {
    envFileCheck.error = error?.message || 'Unknown error';
  }
  
  return NextResponse.json({
    nodeEnv: process.env.NODE_ENV,
    directEnvCheck,
    moduleEnvCheck,
    envFileCheck,
    cwd: process.cwd(),
  });
} 