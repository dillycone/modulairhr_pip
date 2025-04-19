import { NextRequest, NextResponse } from 'next/server';
import { withRateLimit } from '@/lib/middleware/rate-limit';
import { refreshServerSession } from "@/lib/helpers/refresh-session";

// Rate limit options
const RATE_LIMIT_OPTIONS = {
  identifier: 'api:session-refresh',
  limit: 1,
  windowInSeconds: 300, // 5 minutes
  backend: 'memory' as const,
};

// Handler function
async function handler(req: NextRequest) {
  try {
    const result = await refreshServerSession(req);
    return NextResponse.json(result.body, { status: result.status });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: 'Server error',
      error: error.message
    }, { status: 500 });
  }
} 

// Export GET with rate limit
export async function GET(req: NextRequest) {
  return withRateLimit(req, handler, RATE_LIMIT_OPTIONS, () => 'sessionFixIP');
}