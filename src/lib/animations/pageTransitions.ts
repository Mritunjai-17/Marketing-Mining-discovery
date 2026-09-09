import gsap from 'gsap';

export function animatePageIn(node: HTMLElement, onComplete?: () => void) {
  gsap.fromTo(
    node,
    { opacity: 0, y: 15 },
    {
      opacity: 1,
      y: 0,
      duration: 0.7,
      ease: 'power2.out',
      onComplete,
    }
  );
}

export function animatePageOut(node: HTMLElement, onComplete?: () => void) {
  gsap.to(node, {
    opacity: 0,
    y: -15,
    duration: 0.4,
    ease: 'power2.in',
    onComplete,
  });
}
