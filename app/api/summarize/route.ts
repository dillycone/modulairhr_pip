import { NextRequest, NextResponse } from 'next/server';
import { env } from '@/lib/env';
import { z } from 'zod';
import { buildSummarizationPrompt, SummarizeOptions, SummarizeVersion } from '@/lib/prompts';
import {
  checkAuth,
  makeTextRequest,
  createRateLimitedHandler,
  DEFAULT_REQUIRED_ROLES
} from '@/lib/llm-request-helper';

// Input validation schemas
const summarizeInputSchema = z.object({
  transcript: z.string().min(1).max(100000),
  options: z.object({
    includeHeadings: z.boolean().optional(),
    maxTokens: z.number().optional(),
    temperature: z.number().optional()
  }).optional(),
  version: z.enum(['v1', 'v2', 'a', 'b']).optional()
});

// Rate limit options
const RATE_LIMIT_OPTIONS = {
  identifier: 'api:summarize',
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

    // Parse and validate input
    const body = await req.json();
    
    try {
      const { transcript, options = {}, version } = summarizeInputSchema.parse(body);

      // Determine version to use
      let promptVersion: SummarizeVersion | undefined;
      if (version === 'v2' || version === 'b') {
        promptVersion = SummarizeVersion.B;
      } else if (version === 'v1' || version === 'a') {
        promptVersion = SummarizeVersion.A;
      }
      
      // Build summarization prompt with options
      const summarizeOptions: SummarizeOptions = {
        includeHeadings: options.includeHeadings,
        maxTokens: options.maxTokens,
        temperature: options.temperature
      };
      
      const summarizationPrompt = buildSummarizationPrompt(transcript, promptVersion, summarizeOptions);

      // Make LLM request
      const result = await makeTextRequest<string>(
        summarizationPrompt,
        {
          maxTokens: options.maxTokens || 1000,
          temperature: options.temperature || 0.2,
        }
      );

      if (result.success && result.data) {
        return NextResponse.json({ summary: result.data });
      } else {
        return NextResponse.json({ error: result.error || 'Failed to generate summary' }, { status: 500 });
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