import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
    {
      global: {
        headers: {
          'X-Client-Info': 'wimutisastr-client/1.0',
        },
        fetch: (url, init) => {
          return fetch(url, {
            ...init,
            // Add timeout to prevent hanging requests
            signal: init?.signal ?? AbortSignal.timeout(20000), // 20 second timeout
          });
        },
      },
    }
  );
}

