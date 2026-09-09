import gsap from 'gsap';

/**
 * Scroll reveal helper placeholder prepared for GSAP ScrollTrigger
 */
export function initScrollReveal(element: HTMLElement, options: { delay?: number; y?: number } = {}) {
  const { delay = 0, y = 30 } = options;

  gsap.fromTo(
    element,
    { opacity: 0, y },
    {
      opacity: 1,
      y: 0,
      duration: 1,
      delay,
      ease: 'power3.out',
    }
  );
}
