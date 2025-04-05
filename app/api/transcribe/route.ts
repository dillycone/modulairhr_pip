import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '@/lib/env';

// Log environment status
console.log('Environment check for transcribe API:');
console.log('- Using env module:', !!env);
console.log('- GEMINI_API_KEY loaded:', !!env.GEMINI_API_KEY);
console.log('- Environment complete:', env.isComplete());

// Use the specific model from reference code
const MODEL_NAME = "gemini-2.5-pro-preview-03-25";

// Use API key from environment
const API_KEY = env.GEMINI_API_KEY;

export async function POST(req: NextRequest) {
  try {
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });

    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Convert file to Buffer and then to base64
    const buffer = Buffer.from(await file.arrayBuffer());
    const base64Audio = buffer.toString('base64');

    const audioPart = {
      inlineData: {
        mimeType: file.type,
        data: base64Audio,
      },
    };

    const parts = [
      audioPart,
      { text: "Transcribe and diarize the attached file." },
    ];

    const result = await model.generateContent({
      contents: [{ role: "user", parts }],
      generationConfig: {
        responseMimeType: "text/plain",
      }
    });

    if (result.response) {
        const transcript = result.response.text();
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