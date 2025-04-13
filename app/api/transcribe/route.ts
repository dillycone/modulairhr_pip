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
  name: z.string().min(1).max(100),
  role: z.string().min(1).max(100)
});

const transcribeInputSchema = z.object({
  // Accept either a File or a Blob
  audio: z.instanceof(Blob).optional(),
  file: z.instanceof(File).optional(),
  prompt: z.string().min(1).max(2000).optional(),
  speakers: z.array(speakerSchema).optional()
}).refine(data => data.audio || data.file, {
  message: "Either 'audio' or 'file' must be provided"
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

    // Parse and validate input from form data
    const formData = await req.formData();
    
    // Check for either audio blob or file
    const audioBlob = formData.get('audio') as Blob | null;
    const file = formData.get('file') as File | null;
    const speakersJson = formData.get('speakers') as string | null;
    const prompt = formData.get('prompt') as string | null;

    // The actual audio file to process (either from 'audio' or 'file' field)
    let audioFile: Blob;
    let mimeType: string;

    if (file) {
      audioFile = file;
      mimeType = file.type;
    } else if (audioBlob) {
      audioFile = audioBlob;
      mimeType = audioBlob.type || 'audio/webm'; // Default to webm for audio blobs from recording
    } else {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
    }

    // Parse speakers information
    let speakers: { name: string, role: string }[] = [];
    if (speakersJson) {
      try {
        speakers = JSON.parse(speakersJson);
        // Validate the speakers array
        if (!Array.isArray(speakers) || !speakers.every(s => typeof s.name === 'string' && typeof s.role === 'string')) {
          return NextResponse.json({ error: 'Invalid speakers format' }, { status: 400 });
        }
      } catch (error) {
        console.error('Error parsing speakers JSON:', error);
        return NextResponse.json({ error: 'Invalid speakers JSON' }, { status: 400 });
      }
    }

    // Generate a default prompt if none was provided (ensuring it includes speaker info)
    let transcriptionPrompt = prompt || generateDefaultPrompt(speakers);
    
    // Initialize Gemini model
    const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });

    // Convert file to Buffer and then to base64
    const buffer = Buffer.from(await audioFile.arrayBuffer());
    const base64Audio = buffer.toString('base64');

    const audioPart = {
      inlineData: {
        mimeType: mimeType,
        data: base64Audio,
      },
    };

    const parts = [
      audioPart,
      { text: transcriptionPrompt },
    ];

    // Generate the transcript
    const result = await model.generateContent({
      contents: [{ role: "user", parts }],
      generationConfig: {
        responseMimeType: "text/plain",
      }
    });

    if (result.response) {
      let transcript = result.response.text();
      
      // Ensure transcript has proper formatting
      if (transcript) {
        // Process transcript to ensure timestamp format is consistent
        transcript = formatTranscript(transcript, speakers);
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

/**
 * Generates a default prompt for transcription with proper speaker diarization instructions
 */
function generateDefaultPrompt(speakers: { name: string, role: string }[]): string {
  return `Analyze the provided audio file to perform speaker diarization and generate accurate timestamps.

Instructions:
1. Identify each distinct speaker in the conversation using the provided speaker information:
${speakers.map((s, i) => `   - Replace "Speaker ${i + 1}" with "${s.name}" (${s.role})`).join('\n')}
2. Determine the precise start time for each speaker's utterance based on the source timing.
3. Format the output with each utterance on a new line, starting with the accurate timestamp in MM:SS format, followed by the speaker's name and a colon.

Example Output Format:
00:05 ${speakers[0]?.name || 'Speaker'}: [utterance]
00:09 ${speakers[1]?.name || 'Speaker'}: [utterance]
01:15 ${speakers[0]?.name || 'Speaker'}: [utterance]`;
}

/**
 * Ensures transcript has proper formatting with timestamps and speaker names
 */
function formatTranscript(transcript: string, speakers: { name: string, role: string }[]): string {
  // First, ensure each line starts with a timestamp in MM:SS format
  let formattedText = transcript
    .split('\n')
    .map(line => {
      // If the line doesn't start with a timestamp pattern (MM:SS), try to add one
      if (!line.match(/^\d{1,2}:\d{2}/)) {
        // Skip empty lines or preserve formatting lines
        if (!line.trim() || line.trim().startsWith('-')) {
          return line;
        }
        // Add a default timestamp if missing
        return `00:00 ${line}`;
      }
      return line;
    })
    .join('\n');
  
  // Ensure proper speaker names are used
  speakers.forEach((speaker, index) => {
    // Replace both "Speaker X:" and just "Speaker X" (with or without colon)
    const speakerPattern = new RegExp(`Speaker ${index + 1}:?\\s`, 'g');
    formattedText = formattedText.replace(speakerPattern, `${speaker.name}: `);
  });
  
  return formattedText;
}