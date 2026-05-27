/**
 * Server startup hooks. Production env checks are inlined here so Turbopack
 * can resolve them without re-export issues from lib/utils/env.ts.
 *
 * IMPORTANT: This runs once per Node.js process cold-start on Vercel.
 * It must NEVER throw at runtime — a throw here kills the serverless
 * function and turns every dynamic route into HTTP 500.
 *
 * Strict failure ("block deploy") is opt-in via ENFORCE_PRODUCTION_ENV=1,
 * which is intended for CI / build-time validation, not the live runtime.
 */

function optionalEnv(name: string): string | undefined {
  const value = process.env[name];
  return value && value.trim() !== '' ? value.trim() : undefined;
}

type ValidationResult = {
  errors: string[];
  warnings: string[];
};

function validateProductionEnvironment(): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (process.env.NODE_ENV !== 'production') {
    return { errors, warnings };
  }

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
  if (!tokenSecret) {
    errors.push('CONTENT_TOKEN_SECRET is required (storage/video/content tokens are signed with it)');
  } else if (tokenSecret.length < 32) {
    warnings.push(
      `CONTENT_TOKEN_SECRET is only ${tokenSecret.length} chars — generate a longer secret (>=32) with: openssl rand -base64 32`
    );
  }

  if (!optionalEnv('NEXT_PUBLIC_TURNSTILE_SITE_KEY') || !optionalEnv('TURNSTILE_SECRET_KEY')) {
    warnings.push('Turnstile keys not configured — login/register bot protection is disabled');
  }

  return { errors, warnings };
}

export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return;

  const { errors, warnings } = validateProductionEnvironment();

  for (const warning of warnings) {
    console.warn(`[env warning] ${warning}`);
  }

  for (const err of errors) {
    console.error(`[env error] ${err}`);
  }

  // Strict mode is opt-in (CI / build-time check only). Even when enabled,
  // we throw only outside of the live serverless runtime so we never take
  // down the production app.
  const strict = process.env.ENFORCE_PRODUCTION_ENV === '1';
  const isLiveServerless = process.env.VERCEL === '1' && process.env.NODE_ENV === 'production';

  if (strict && !isLiveServerless && errors.length > 0) {
    const message = errors.map((e) => `  - ${e}`).join('\n');
    throw new Error(
      `Production environment validation failed:\n${message}\n\nFix these before deploying to production.`
    );
  }
}
