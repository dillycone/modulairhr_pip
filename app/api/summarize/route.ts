import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '@/lib/env';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import type { Database } from '@/types/supabase';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { z } from 'zod';

// Use the specific model from reference code
const MODEL_NAME = "gemini-2.5-pro-preview-03-25";

// Use API key from environment
const API_KEY = env.GEMINI_API_KEY;

// Input validation schemas
const summarizeInputSchema = z.object({
  transcript: z.string().min(1).max(100000)
});

// Rate limiter: 10 requests per hour per user
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '1 h'),
  analytics: true,
});

// Required roles to access this endpoint
const REQUIRED_ROLES = ['admin', 'manager', 'hr_admin'] as const;

export async function POST(req: NextRequest) {
  try {
    // Initialize Supabase client
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
    const body = await req.json();
    
    try {
      const { transcript } = summarizeInputSchema.parse(body);

      // Initialize Gemini model
      const genAI = new GoogleGenerativeAI(API_KEY);
      const model = genAI.getGenerativeModel({ model: MODEL_NAME });

      // Summarization prompt
      const summarizationPrompt = `
        Please summarize the following transcript of a meeting or conversation:
        
        ${transcript}
        
        Create a concise, well-structured summary that includes:
        1. Main topic and purpose of the conversation
        2. Key points discussed
        3. Action items or decisions made
        4. Important deadlines or dates mentioned
        
        Format the summary with sections and bullet points for readability.
      `;

      // Generate the summary
      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: summarizationPrompt }] }],
        generationConfig: {
          maxOutputTokens: 1000,
          temperature: 0.2,
        }
      });

      if (result.response) {
        const summary = result.response.text();
        
        if (summary) {
          return NextResponse.json({ summary });
        } else {
          console.error("Error extracting summary from Gemini response:", result.response);
          return NextResponse.json({ error: 'Failed to extract summary from response' }, { status: 500 });
        }
      } else {
        console.error("Error generating summary:", result);
        return NextResponse.json({ error: 'Failed to generate summary' }, { status: 500 });
      }
    } catch (validationError) {
      console.error('Validation error:', validationError);
      return NextResponse.json({ error: 'Invalid input data' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error processing summarization request:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}