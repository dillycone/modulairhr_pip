import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '@/lib/env';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import type { Database } from '@/types/supabase';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { z } from 'zod';

// Log environment status
console.log('Environment check for transcribe API:');
console.log('- Using env module:', !!env);
console.log('- GEMINI_API_KEY loaded:', !!env.GEMINI_API_KEY);

// Use the specific model from reference code
const MODEL_NAME = "gemini-2.5-pro-preview-03-25";

// Use API key from environment
const API_KEY = env.GEMINI_API_KEY;

// Input validation schemas
const speakerSchema = z.object({
  name: z.string().min(1).max(100)
});

const transcribeInputSchema = z.object({
  file: z.instanceof(File),
  prompt: z.string().min(1).max(1000),
  speakers: z.array(speakerSchema).optional()
});

// Rate limiter: 10 requests per hour per user
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '1 h'),
  analytics: true,
});

// Required roles to access this endpoint
const REQUIRED_ROLES = ['admin', 'manager', 'hr_admin'] as const;
type AllowedRole = typeof REQUIRED_ROLES[number];

export async function POST(req: NextRequest) {
  try {
    // Initialize Supabase client
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient<Database>({ 
      cookies: () => cookieStore 
    });

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
      // Check user roles - standardized approach
      const userRoles = session.user.app_metadata?.roles as string[] | undefined || [];
      const canAccess = REQUIRED_ROLES.some(requiredRole => userRoles.includes(requiredRole));
      
      if (!canAccess) {
        return NextResponse.json(
          { error: 'Forbidden - Insufficient permissions' },
          { status: 403 }
        );
      }
    }

    // Apply rate limiting
    const { success, limit, reset, remaining } = await ratelimit.limit(session.user.id);
    if (!success) {
      return NextResponse.json({
        error: 'Too many requests',
        limit,
        reset,
        remaining
      }, { 
        status: 429,
        headers: {
          'X-RateLimit-Limit': limit.toString(),
          'X-RateLimit-Remaining': remaining.toString(),
          'X-RateLimit-Reset': reset.toString()
        }
      });
    }

    // Parse and validate input
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const prompt = formData.get('prompt') as string | null;
    const speakersJson = formData.get('speakers') as string | null;

    try {
      const speakers = speakersJson ? JSON.parse(speakersJson) : undefined;
      transcribeInputSchema.parse({
        file,
        prompt,
        speakers
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json({ error: 'Invalid input', details: error.errors }, { status: 400 });
      }
      throw error;
    }

    // Rest of the existing code remains unchanged
    const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });

    // Convert file to Buffer and then to base64
    const buffer = Buffer.from(await file!.arrayBuffer());
    const base64Audio = buffer.toString('base64');

    const audioPart = {
      inlineData: {
        mimeType: file!.type,
        data: base64Audio,
      },
    };

    const parts = [
      audioPart,
      { text: prompt! },
    ];

    const result = await model.generateContent({
      contents: [{ role: "user", parts }],
      generationConfig: {
        responseMimeType: "text/plain",
      }
    });

    if (result.response) {
      let transcript = result.response.text();
      
      // If we have speaker information, try to ensure the transcript uses the correct names
      if (speakersJson && transcript) {
        try {
          const speakers = JSON.parse(speakersJson);
          speakers.forEach((speaker: { name: string }, index: number) => {
            const speakerPattern = new RegExp(`Speaker ${index + 1}:`, 'g');
            transcript = transcript.replace(speakerPattern, `${speaker.name}:`);
          });
        } catch (e) {
          console.error('Error processing speaker information:', e);
        }
      }
      
      if (transcript) {
        return NextResponse.json({ transcript });
      } else {
        console.error("Error extracting transcript from Gemini response:", result.response);
        return NextResponse.json({ error: 'Failed to extract transcript from response' }, { status: 500 });
      }
    } else {
      console.error("Error generating transcript:", result);
      return NextResponse.json({ error: 'Failed to generate transcript' }, { status: 500 });
    }

  } catch (error) {
    console.error('Error processing transcription request:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}