/**
 * Server startup hooks. Production env checks are inlined here so Turbopack
 * can resolve them without re-export issues from lib/utils/env.ts.
 */

function optionalEnv(name: string): string | undefined {
  const value = process.env[name];
  return value && value.trim() !== '' ? value.trim() : undefined;
}

function validateProductionEnvironment(): {
  valid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (process.env.NODE_ENV !== 'production') {
    return { valid: true, errors, warnings };
  }

  const enforceStrict =
    process.env.VERCEL === '1' || process.env.ENFORCE_PRODUCTION_ENV === '1';

  const barayOk = Boolean(
    optionalEnv('BARAY_API_KEY') && optionalEnv('BARAY_SK') && optionalEnv('BARAY_IV')
  );
  if (!barayOk) {
    errors.push('Baray payment credentials missing (BARAY_API_KEY, BARAY_SK, BARAY_IV)');
  }

  const appUrl = optionalEnv('NEXT_PUBLIC_APP_URL');
  if (!appUrl) {
    errors.push(
      'NEXT_PUBLIC_APP_URL is required in production (Baray redirects, sitemap, canonical URLs)'
    );
  } else if (appUrl.includes('vercel.app') || appUrl.includes('localhost')) {
    warnings.push(
      `NEXT_PUBLIC_APP_URL is "${appUrl}" — set your production domain (e.g. https://wimutisastr.com) before launch`
    );
  }

  if (!optionalEnv('ALLOWED_ORIGINS')) {
    warnings.push('ALLOWED_ORIGINS is not set — API CORS may block legitimate requests');
  }

  if (!optionalEnv('UPSTASH_REDIS_REST_URL') || !optionalEnv('UPSTASH_REDIS_REST_TOKEN')) {
    warnings.push(
      'UPSTASH_REDIS_REST_URL/TOKEN not set — rate limiting falls back to in-memory (not reliable on Vercel)'
    );
  }

  const tokenSecret = optionalEnv('CONTENT_TOKEN_SECRET');
  if (tokenSecret && tokenSecret.length < 32) {
    errors.push('CONTENT_TOKEN_SECRET must be at least 32 characters');
  }

  if (!optionalEnv('NEXT_PUBLIC_TURNSTILE_SITE_KEY') || !optionalEnv('TURNSTILE_SECRET_KEY')) {
    warnings.push('Turnstile keys not configured — login/register bot protection is disabled');
  }

  if (!enforceStrict) {
    return {
      valid: true,
      errors: [],
      warnings: [...warnings, ...errors.map((e) => `[would block deploy] ${e}`)],
    };
  }

  return { valid: errors.length === 0, errors, warnings };
}

export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return;

  const result = validateProductionEnvironment();

  for (const warning of result.warnings) {
    console.warn(`[env] ${warning}`);
  }

  if (!result.valid) {
    const message = result.errors.map((e) => `  - ${e}`).join('\n');
    throw new Error(
      `Production environment validation failed:\n${message}\n\nFix these before deploying to production.`
    );
  }
}
