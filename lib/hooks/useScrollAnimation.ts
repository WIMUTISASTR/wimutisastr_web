import { useEffect } from 'react';

/**
 * Custom hook for scroll-based animations using IntersectionObserver
 * Automatically animates elements with class 'scroll-animate' when they come into view
 * 
 * @param options - IntersectionObserver options
 * @returns void
 */
export function useScrollAnimation(
  options: IntersectionObserverInit = {
    threshold: 0.1,
    rootMargin: '0px',
  }
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

    const animatedElements = document.querySelectorAll('.scroll-animate');
    
    animatedElements.forEach((el) => {
      observer.observe(el);
      
      // Immediately animate elements already in viewport
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        setTimeout(() => {
          el.classList.add('animate-in');
        }, 50);
      }
    });

    return () => observer.disconnect();
  }, [options.threshold, options.rootMargin]);
}

export default useScrollAnimation;
