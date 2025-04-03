/**
 * Common config or environment flags for dev vs. prod usage.
 */

export const isDev = process.env.NODE_ENV === 'development';

// If you need additional environment-based checks, you can add them here.
// For example:
// export const isProd = process.env.NODE_ENV === 'production';
// export const isTest = process.env.NODE_ENV === 'test';
// ... etc. 