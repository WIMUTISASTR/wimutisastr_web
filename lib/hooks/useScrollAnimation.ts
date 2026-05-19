import { useEffect } from 'react';

const DEFAULT_OPTIONS: IntersectionObserverInit = {
  threshold: 0.1,
  rootMargin: '0px',
};

function isInViewport(el: Element): boolean {
  const rect = el.getBoundingClientRect();
  return rect.top < window.innerHeight && rect.bottom > 0;
}

/** Reveal any in-viewport `.scroll-animate` nodes (e.g. after async home data mounts). */
export function rescanScrollAnimations(): void {
  document.querySelectorAll('.scroll-animate:not(.animate-in)').forEach((el) => {
    if (isInViewport(el)) {
      el.classList.add('animate-in');
    }
  });
}

/**
 * Scroll-based reveal for `.scroll-animate` elements.
 * Pass `deps` (e.g. when home API data finishes loading) to observe newly mounted nodes.
 */
export function useScrollAnimation(
  options: IntersectionObserverInit = DEFAULT_OPTIONS,
  deps: ReadonlyArray<unknown> = []
) {
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
          observer.unobserve(entry.target);
        }
      });
    }, options);

    const observePending = () => {
      document.querySelectorAll('.scroll-animate:not(.animate-in)').forEach((el) => {
        if (isInViewport(el)) {
          el.classList.add('animate-in');
          return;
        }
        observer.observe(el);
      });
    };

    observePending();
    rescanScrollAnimations();

    const t1 = window.setTimeout(observePending, 100);
    const t2 = window.setTimeout(observePending, 400);

    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      observer.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- deps are forwarded intentionally
  }, [options.threshold, options.rootMargin, ...deps]);
}

export default useScrollAnimation;
