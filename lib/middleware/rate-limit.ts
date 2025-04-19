import { NextRequest, NextResponse } from 'next/server';
import { createRateLimiter, createRateLimitResponse, RateLimiterOptions } from '../rate-limiter';

export async function withRateLimit(
  req: NextRequest,
  handler: (req: NextRequest) => Promise<NextResponse>,
  options: RateLimiterOptions,
  keyGenerator: (req: NextRequest) => string | Promise<string>
) {
  const rateLimiter = createRateLimiter(options);
  const key = await Promise.resolve(keyGenerator(req));
  
  const result = await rateLimiter.limit(key);
  
  if (!result.success) {
    return createRateLimitResponse(result);
  }
  
  return handler(req);
}