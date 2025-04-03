import { isDev } from '@/lib/config';

/**
 * A single debug logging utility that checks `isDev` or a separate `DEBUG` flag.
 * This allows removing scattered console.log in production logic.
 */
export function debugLog(...args: unknown[]): void {
  if (isDev) {
    // Print all arguments if in development
    console.log('[DEBUG]', ...args);
  }
}

/**
 * If you want a more robust approach, you can add levels (info, warn, error),
 * or a specific environment variable, etc.
 * 
 * e.g.
 * export function debugLog(level: 'info'|'warn'|'error', ...args: unknown[]): void {
 *   if (process.env.NEXT_PUBLIC_DEBUG === 'true') {
 *     console[level]('[DEBUG]', ...args);
 *   }
 * }
 */ 