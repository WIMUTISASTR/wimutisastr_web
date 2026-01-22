/**
 * Client-side CSRF token management
 * Use this in your React components and API calls
 */

let cachedCsrfToken: string | null = null;
let tokenExpiry: number | null = null;

/**
 * Fetch CSRF token from server
 * Caches the token for reuse within the same session
 */
export async function getCsrfToken(force = false): Promise<string> {
  // Return cached token if still valid
  if (!force && cachedCsrfToken && tokenExpiry && Date.now() < tokenExpiry) {
    return cachedCsrfToken;
  }

  try {
    const response = await fetch('/api/csrf-token', {
      method: 'GET',
      credentials: 'include', // Important: include cookies
    });

    if (!response.ok) {
      throw new Error('Failed to fetch CSRF token');
    }

    const data = await response.json();
    const token = data.csrfToken;
    
    if (!token) {
      throw new Error('CSRF token not received from server');
    }
    
    cachedCsrfToken = token;
    
    // Cache token for 55 minutes (tokens expire after 1 hour)
    tokenExpiry = Date.now() + 55 * 60 * 1000;
    
    return token;
  } catch (error) {
    console.error('Error fetching CSRF token:', error);
    throw error;
  }
}

/**
 * Clear cached CSRF token (use after logout or on error)
 */
export function clearCsrfToken(): void {
  cachedCsrfToken = null;
  tokenExpiry = null;
}

/**
 * Make an API request with CSRF token automatically included
 */
export async function fetchWithCsrf(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const method = (options.method || 'GET').toUpperCase();
  
  // Only add CSRF token for state-changing methods
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    const csrfToken = await getCsrfToken();
    
    options.headers = {
      ...options.headers,
      'X-CSRF-Token': csrfToken,
    };
  }

  options.credentials = 'include'; // Important: include cookies

  const response = await fetch(url, options);

  // Clear token on CSRF error
  if (response.status === 403) {
    const data = await response.json().catch(() => ({}));
    if (data.code === 'CSRF_VALIDATION_FAILED') {
      clearCsrfToken();
    }
  }

  return response;
}

/**
 * Initialize CSRF token on app start
 * Call this in your app's root layout or main component
 * 
 * @example
 * ```tsx
 * import { initCsrfToken } from '@/lib/csrf-client';
 * 
 * function App() {
 *   useEffect(() => {
 *     initCsrfToken();
 *   }, []);
 *   
 *   return <YourApp />;
 * }
 * ```
 */
export async function initCsrfToken(): Promise<void> {
  try {
    await getCsrfToken();
  } catch (error) {
    console.error('Failed to initialize CSRF token:', error);
  }
}
