import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

export async function GET() {
  try {
    // Create Redis client
    const redis = Redis.fromEnv();

    // Try to set and get a test value
    const testKey = 'test-key-' + Date.now();
    const testValue = 'test-value-' + Date.now();

    // Set the test value
    await redis.set(testKey, testValue);

    // Get the test value back
    const retrievedValue = await redis.get(testKey);

    // Clean up
    await redis.del(testKey);

    // Check if the values match
    const isWorking = testValue === retrievedValue;

    return NextResponse.json({
      status: 'success',
      working: isWorking,
      environment: process.env.VERCEL_ENV || 'local',
      redisUrl: process.env.UPSTASH_REDIS_REST_URL ? 'configured' : 'missing',
      redisToken: process.env.UPSTASH_REDIS_REST_TOKEN ? 'configured' : 'missing',
      test: {
        expected: testValue,
        received: retrievedValue
      }
    });

  } catch (error: any) {
    console.error('Redis test error:', error);
    return NextResponse.json({
      status: 'error',
      message: error.message,
      environment: process.env.VERCEL_ENV || 'local',
      redisUrl: process.env.UPSTASH_REDIS_REST_URL ? 'configured' : 'missing',
      redisToken: process.env.UPSTASH_REDIS_REST_TOKEN ? 'configured' : 'missing'
    }, { status: 500 });
  }
} 