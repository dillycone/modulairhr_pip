import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { buildTranscriptionPrompt, TranscriptionOptions, TranscriptionVersion } from '@/lib/prompts';
import {
  checkAuth,
  makeMultimodalRequest,
  createRateLimitedHandler,
  DEFAULT_REQUIRED_ROLES
} from '@/lib/llm-request-helper';

// Input validation schemas
const speakerSchema = z.object({
  name: z.string().min(1).max(100),
  role: z.string().min(1).max(100)
});

// Rate limit options
const RATE_LIMIT_OPTIONS = {
  identifier: 'api:transcribe',
  limit: 10,
  windowInSeconds: 3600, // 1 hour
  backend: 'redis' as const,
  analytics: true,
};

// Handler function
async function handler(req: NextRequest) {
  try {
    // Check authentication and roles
    const authResult = await checkAuth(DEFAULT_REQUIRED_ROLES);
    if (!authResult.authenticated) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status || 401 });
    }

    // Parse and validate input from form data
    const formData = await req.formData();
    
    // Check for either audio blob or file
    const audioBlob = formData.get('audio') as Blob | null;
    const file = formData.get('file') as File | null;
    const speakersJson = formData.get('speakers') as string | null;
    const prompt = formData.get('prompt') as string | null;
    const optionsJson = formData.get('options') as string | null;
    const version = formData.get('version') as string | null;

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

    // Parse options if provided
    let transcriptionOptions: TranscriptionOptions = {};
    if (optionsJson) {
      try {
        transcriptionOptions = JSON.parse(optionsJson);
      } catch (error) {
        console.error('Error parsing options JSON:', error);
      }
    }
    
    // Determine version to use
    let promptVersion: TranscriptionVersion | undefined;
    if (version === 'v2' || version === 'b') {
      promptVersion = TranscriptionVersion.B;
    } else if (version === 'v1' || version === 'a') {
      promptVersion = TranscriptionVersion.A;
    }
    
    // Build transcription prompt, allow override via custom prompt
    let transcriptionPrompt = prompt || buildTranscriptionPrompt(speakers, promptVersion, transcriptionOptions);
    
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

    // Make multimodal LLM request
    const result = await makeMultimodalRequest<string>(
      parts,
      {
        responseMimeType: "text/plain",
      },
      // Process the response to format the transcript
      (transcript) => formatTranscript(transcript, speakers)
    );

    if (result.success && result.data) {
      return NextResponse.json({ transcript: result.data });
    } else {
      return NextResponse.json({ error: result.error || 'Failed to generate transcript' }, { status: 500 });
    }
  } catch (error) {
    console.error('Error processing transcription request:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
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

// Rate limited handler
export async function POST(req: NextRequest) {
  return createRateLimitedHandler(
    handler,
    RATE_LIMIT_OPTIONS,
    async () => {
      const authResult = await checkAuth();
      return authResult.user?.id || 'anonymous';
    }
  )(req);
}