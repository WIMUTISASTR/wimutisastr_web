/**
 * Secure environment variable validation and access
 * This module ensures environment variables are properly validated
 * and never exposed to the client
 */

interface EnvConfig {
  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: string;
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY: string;
  SUPABASE_SERVICE_ROLE_KEY: string;

  // R2/Storage
  R2_ACCOUNT_ID: string;
  R2_ACCESS_KEY_ID: string;
  R2_SECRET_ACCESS_KEY: string;
  R2_BOOK_BUCKET_NAME: string;
  R2_VIDEO_BUCKET_NAME: string;
  R2_PROOF_OF_PAYMENT_BUCKET_NAME: string;

  // Security
  CONTENT_TOKEN_SECRET: string;

  // Telegram (optional)
  TELEGRAM_BOT_TOKEN?: string;
  TELEGRAM_CHAT_ID?: string;

  // Redis/Upstash for rate limiting (optional but recommended)
  UPSTASH_REDIS_REST_URL?: string;
  UPSTASH_REDIS_REST_TOKEN?: string;

  // Node environment
  NODE_ENV: string;
}

class EnvironmentError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'EnvironmentError';
  }
}

/**
 * Validates that a required environment variable exists
 * @throws {EnvironmentError} if the variable is missing
 */
function getRequiredEnv(key: keyof EnvConfig): string {
  const value = process.env[key];
  
  if (!value || value.trim() === '') {
    throw new EnvironmentError(
      `Missing required environment variable: ${key}. ` +
      `Please check your .env.local file and ensure this variable is set.`
    );
  }
  
  // Always trim to remove accidental whitespace
  return value.trim();
}

/**
 * Gets an optional environment variable
 */
function getOptionalEnv(key: keyof EnvConfig): string | undefined {
  const value = process.env[key];
  return value && value.trim() !== '' ? value.trim() : undefined;
}

/**
 * Validates all required environment variables at startup
 * Should be called once during application initialization
 */
export function validateEnvironment(): void {
  const requiredVars: (keyof EnvConfig)[] = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'R2_ACCOUNT_ID',
    'R2_ACCESS_KEY_ID',
    'R2_SECRET_ACCESS_KEY',
    'R2_BOOK_BUCKET_NAME',
    'R2_VIDEO_BUCKET_NAME',
    'R2_PROOF_OF_PAYMENT_BUCKET_NAME',
    'CONTENT_TOKEN_SECRET',
  ];

  const missing: string[] = [];

  for (const varName of requiredVars) {
    try {
      getRequiredEnv(varName);
    } catch (error) {
      missing.push(varName);
    }
  }

  if (missing.length > 0) {
    throw new EnvironmentError(
      `Missing required environment variables:\n${missing.map(v => `  - ${v}`).join('\n')}\n\n` +
      `Please ensure these are set in your .env.local file.`
    );
  }
}

/**
 * Safe environment variable access
 * All server-side code should use these getters instead of accessing process.env directly
 */
export const env = {
  // Supabase
  supabase: {
    url: () => getRequiredEnv('NEXT_PUBLIC_SUPABASE_URL'),
    anonKey: () => getRequiredEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY'),
    serviceRoleKey: () => getRequiredEnv('SUPABASE_SERVICE_ROLE_KEY'),
  },

  // R2/Storage
  r2: {
    accountId: () => getRequiredEnv('R2_ACCOUNT_ID'),
    accessKeyId: () => getRequiredEnv('R2_ACCESS_KEY_ID'),
    secretAccessKey: () => getRequiredEnv('R2_SECRET_ACCESS_KEY'),
    bookBucket: () => getRequiredEnv('R2_BOOK_BUCKET_NAME'),
    videoBucket: () => getRequiredEnv('R2_VIDEO_BUCKET_NAME'),
    proofOfPaymentBucket: () => getRequiredEnv('R2_PROOF_OF_PAYMENT_BUCKET_NAME'),
  },

  // Security
  security: {
    contentTokenSecret: () => getRequiredEnv('CONTENT_TOKEN_SECRET'),
  },

  // Telegram
  telegram: {
    botToken: () => getOptionalEnv('TELEGRAM_BOT_TOKEN'),
    chatId: () => getOptionalEnv('TELEGRAM_CHAT_ID'),
  },

  // Redis/Upstash
  redis: {
    url: () => getOptionalEnv('UPSTASH_REDIS_REST_URL'),
    token: () => getOptionalEnv('UPSTASH_REDIS_REST_TOKEN'),
  },

  // System
  isProduction: () => process.env.NODE_ENV === 'production',
  isDevelopment: () => process.env.NODE_ENV === 'development',
  nodeEnv: () => process.env.NODE_ENV || 'development',
} as const;

/**
 * Public environment variables that are safe to expose to the client
 * These should only include NEXT_PUBLIC_* variables
 */
export const publicEnv = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY || '',
} as const;
