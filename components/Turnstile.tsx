'use client';

import { useEffect, useRef } from 'react';

interface TurnstileProps {
  onVerify: (token: string) => void;
  onError?: () => void;
  onExpire?: () => void;
  onLoad?: () => void;
  onUnconfigured?: () => void;
}

declare global {
  interface Window {
    turnstile?: {
      render: (element: HTMLElement, options: object) => string;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
    };
  }
}

// Module-level singletons so multiple <Turnstile /> mounts (and React StrictMode
// double-invocation in dev) share one loader script + one ready-promise.
const TURNSTILE_SRC =
  'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
let turnstileReadyPromise: Promise<void> | null = null;

function loadTurnstileScript(): Promise<void> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Turnstile can only load in the browser'));
  }
  if (window.turnstile) {
    return Promise.resolve();
  }
  if (turnstileReadyPromise) {
    return turnstileReadyPromise;
  }

  turnstileReadyPromise = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      'script[data-turnstile-loader="true"]'
    );
    const script = existing ?? document.createElement('script');
    if (!existing) {
      script.src = TURNSTILE_SRC;
      script.async = true;
      script.defer = true;
      script.dataset.turnstileLoader = 'true';
      document.head.appendChild(script);
    }
    script.addEventListener(
      'load',
      () => {
        if (window.turnstile) resolve();
        else reject(new Error('Turnstile loaded but global is missing'));
      },
      { once: true }
    );
    script.addEventListener(
      'error',
      () => reject(new Error('Failed to load Turnstile script')),
      { once: true }
    );
  });

  return turnstileReadyPromise;
}

export default function Turnstile({
  onVerify,
  onError,
  onExpire,
  onLoad,
  onUnconfigured,
}: TurnstileProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);

  // Keep latest callbacks in a ref so the effect runs only once per mount,
  // even if the parent re-renders with new inline arrow functions.
  const callbacksRef = useRef({ onVerify, onError, onExpire, onLoad, onUnconfigured });
  callbacksRef.current = { onVerify, onError, onExpire, onLoad, onUnconfigured };

  useEffect(() => {
    const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
    if (!siteKey) {
      console.warn('Turnstile site key not configured - skipping verification');
      callbacksRef.current.onUnconfigured?.();
      return;
    }

    let cancelled = false;

    loadTurnstileScript()
      .then(() => {
        if (cancelled || !containerRef.current || !window.turnstile) return;
        if (widgetIdRef.current) return; // guard against StrictMode double-run

        widgetIdRef.current = window.turnstile.render(containerRef.current, {
          sitekey: siteKey,
          callback: (token: string) => callbacksRef.current.onVerify(token),
          'error-callback': () => callbacksRef.current.onError?.(),
          'expired-callback': () => callbacksRef.current.onExpire?.(),
          theme: 'light',
        });
        callbacksRef.current.onLoad?.();
      })
      .catch(() => {
        if (cancelled) return;
        console.warn(
          'Turnstile script blocked or failed to load - proceeding without bot protection'
        );
        callbacksRef.current.onUnconfigured?.();
      });

    return () => {
      cancelled = true;
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch {
          // ignore: widget may already be gone (e.g. StrictMode cleanup)
        }
        widgetIdRef.current = null;
      }
    };
  }, []);

  if (!process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY) {
    return null;
  }

  return <div ref={containerRef} />;
}
