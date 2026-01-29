import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { env } from '@/lib/utils/env';

/**
 * Server-side Supabase client with ANON key - respects RLS
 * Use this for user-scoped operations
 * This is the default and safest option
 */
export function createServerClient() {
  return createClient(
    env.supabase.url(),
    env.supabase.anonKey(),
    {
      auth: {
        persistSession: false, // Server-side doesn't need session persistence
        autoRefreshToken: false,
      },
      global: {
        headers: {
          'X-Client-Info': 'wimutisastr-web/1.0',
        },
        fetch: (url, init) => {
          return fetch(url, {
            ...init,
            // Add timeout to prevent hanging Supabase queries
            signal: init?.signal ?? AbortSignal.timeout(20000), // 20 second timeout
          });
        },
      },
    }
  );
}

/**
 * Admin client with SERVICE ROLE key - bypasses RLS
 * ⚠️ WARNING: Use ONLY for admin operations that require bypassing RLS
 * Must verify admin permissions before using this client
 * 
 * @example
 * ```typescript
 * // Verify admin first
 * if (userRole !== 'admin') throw new Error('Unauthorized');
 * const adminClient = createAdminClient();
 * await adminClient.from('payment_proofs').update(...);
 * ```
 */
export function createAdminClient() {
  return createClient(
    env.supabase.url(),
    env.supabase.serviceRoleKey(),
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
      global: {
        headers: {
          'X-Client-Info': 'wimutisastr-admin/1.0',
        },
        fetch: (url, init) => {
          return fetch(url, {
            ...init,
            // Add timeout to prevent hanging Supabase queries
            signal: init?.signal ?? AbortSignal.timeout(20000), // 20 second timeout
          });
        },
      },
    }
  );
}

/**
 * Create server client with user authentication from cookies
 * Use this for authenticated user-scoped operations
 */
export async function createServerClientWithAuth() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('sb-access-token')?.value;
  const refreshToken = cookieStore.get('sb-refresh-token')?.value;

  const client = createServerClient();

  if (accessToken && refreshToken) {
    await client.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });
  }

  return client;
}
