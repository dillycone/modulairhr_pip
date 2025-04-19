import { Redis } from '@upstash/redis';
import { Ratelimit as UpstashRatelimit } from '@upstash/ratelimit';
import { NextResponse } from 'next/server';

// Interface for rate limit result
export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
  rateLimited: boolean;
  retryAfterSeconds?: number;
}

// Interface for rate limiter options
export interface RateLimiterOptions {
  // Number of requests per window
  limit: number;
  // Window size in seconds
  windowInSeconds: number;
  // Identifier for the rate limit (e.g., 'api:summarize')
  identifier: string;
  // Backend type: 'redis' or 'memory'
  backend?: 'redis' | 'memory';
  // Analytics flag for Redis backend
  analytics?: boolean;
}

// Base class for rate limiters
abstract class BaseRateLimiter {
  protected options: RateLimiterOptions;

  constructor(options: RateLimiterOptions) {
    this.options = {
      ...options,
      backend: options.backend || 'redis',
      analytics: options.analytics !== undefined ? options.analytics : true,
    };
  }

  abstract limit(key: string): Promise<RateLimitResult>;
}

// Redis-based rate limiter using Upstash
class RedisRateLimiter extends BaseRateLimiter {
  private rateLimiter: UpstashRatelimit;

  constructor(options: RateLimiterOptions) {
    super(options);
    
    const redis = Redis.fromEnv();
    const windowMs = options.windowInSeconds * 1000;
    
    this.rateLimiter = new UpstashRatelimit({
      redis,
      limiter: UpstashRatelimit.slidingWindow(options.limit, `${windowMs}ms`),
      analytics: options.analytics,
      prefix: options.identifier,
    });
  }

  async limit(key: string): Promise<RateLimitResult> {
    const result = await this.rateLimiter.limit(key);
    
    return {
      success: result.success,
      limit: result.limit,
      remaining: result.remaining,
      reset: result.reset,
      rateLimited: !result.success,
      retryAfterSeconds: result.success ? undefined : Math.ceil((result.reset - Date.now()) / 1000),
    };
  }
}

// In-memory rate limiter for simpler use cases
class MemoryRateLimiter extends BaseRateLimiter {
  private static rateLimitStore: Map<string, Map<string, number>> = new Map();
  private static cleanupInterval: NodeJS.Timeout | null = null;

  constructor(options: RateLimiterOptions) {
    super(options);
    
    // Initialize store for this identifier if it doesn't exist
    if (!MemoryRateLimiter.rateLimitStore.has(options.identifier)) {
      MemoryRateLimiter.rateLimitStore.set(options.identifier, new Map());
    }
    
    // Setup cleanup interval if not already running
    if (!MemoryRateLimiter.cleanupInterval) {
      MemoryRateLimiter.cleanupInterval = setInterval(() => {
        const now = Date.now();
        
        // Clean up entries for all identifiers
        for (const [identifier, store] of MemoryRateLimiter.rateLimitStore.entries()) {
          for (const [key, timestamp] of store.entries()) {
            if (now - timestamp > options.windowInSeconds * 1000) {
              store.delete(key);
            }
          }
        }
      }, 15 * 60 * 1000); // Clean up every 15 minutes
    }
  }

  async limit(key: string): Promise<RateLimitResult> {
    const store = MemoryRateLimiter.rateLimitStore.get(this.options.identifier)!;
    const now = Date.now();
    const windowMs = this.options.windowInSeconds * 1000;
    
    // Count requests in current window
    let windowStart = now - windowMs;
    let requestsInWindow = 0;
    
    // Get all timestamps for this key and count those within window
    const keyPattern = `${key}:`;
    for (const [existingKey, timestamp] of store.entries()) {
      if (existingKey.startsWith(keyPattern) && timestamp > windowStart) {
        requestsInWindow++;
      }
    }
    
    // Check if limit is exceeded
    const remaining = Math.max(0, this.options.limit - requestsInWindow);
    const success = requestsInWindow < this.options.limit;
    
    // If under limit, record this request
    if (success) {
      store.set(`${key}:${now}`, now);
    }
    
    // Calculate reset time (when oldest request expires)
    const reset = now + windowMs;
    
    return {
      success,
      limit: this.options.limit,
      remaining,
      reset,
      rateLimited: !success,
      retryAfterSeconds: success ? undefined : Math.ceil(windowMs / 1000),
    };
  }
}

// Factory function to create the appropriate rate limiter
export function createRateLimiter(options: RateLimiterOptions): BaseRateLimiter {
  if (options.backend === 'memory') {
    return new MemoryRateLimiter(options);
  }
  
  return new RedisRateLimiter(options);
}

// Helper function to create standard JSON response for rate limiting
export function createRateLimitResponse(result: RateLimitResult) {
  return NextResponse.json({
    error: 'Too many requests',
    limit: result.limit,
    remaining: result.remaining,
    reset: result.reset,
    retryAfterSeconds: result.retryAfterSeconds,
  }, {
    status: 429,
    headers: {
      'X-RateLimit-Limit': result.limit.toString(),
      'X-RateLimit-Remaining': result.remaining.toString(),
      'X-RateLimit-Reset': result.reset.toString(),
      ...(result.retryAfterSeconds
          ? { 'Retry-After': result.retryAfterSeconds.toString() }
          : {})
    }
  });
}