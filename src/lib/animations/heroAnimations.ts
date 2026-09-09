import gsap from 'gsap';

/**
 * GSAP Animation Timeline for Hero Entrance
 * Sequence timings:
 * 0.0s Background appears
 * 0.3s Eyebrow appears
 * 0.5s Main headline reveals
 * 0.9s Supporting statement appears ("We make the world see it.")
 * 1.2s Signal activates & description appears
 * 1.8s Nodes connect & light up
 * 2.5s Labels appear
 * 3.5s Settles into primary interactive state
 */
export function initHeroEntrance(
  container: HTMLElement,
  elements: {
    eyebrow: HTMLElement | null;
    headline: HTMLElement | null;
    supporting: HTMLElement | null;
    description: HTMLElement | null;
    cta: HTMLElement | null;
    signal: HTMLElement | null;
    navigation: HTMLElement | null;
  },
  onComplete?: () => void
): gsap.core.Timeline {
  const tl = gsap.timeline({
    defaults: { ease: 'power3.out', duration: 1.0 },
    onComplete,
  });

  // Initial states setup
  gsap.set(
    [
      elements.eyebrow,
      elements.headline,
      elements.supporting,
      elements.description,
      elements.cta,
      elements.navigation,
    ].filter(Boolean),
    {
      y: 35,
      opacity: 0,
    }
  );

  if (elements.signal) {
    gsap.set(elements.signal, { opacity: 0, scale: 0.96 });
  }

  // Exact Sequence Timeline
  tl.to(elements.eyebrow, { y: 0, opacity: 1, duration: 0.7 }, 0.3)
    .to(elements.headline, { y: 0, opacity: 1, duration: 0.9, ease: 'power2.out' }, 0.5)
    .to(elements.supporting, { y: 0, opacity: 1, duration: 0.8 }, 0.9)
    .to(elements.signal, { opacity: 1, scale: 1, duration: 1.3, ease: 'power2.out' }, 1.2)
    .to(elements.description, { y: 0, opacity: 1, duration: 0.7 }, 1.2)
    .to(elements.cta, { y: 0, opacity: 1, duration: 0.7 }, 1.5)
    .to(elements.navigation, { y: 0, opacity: 1, duration: 0.8 }, 1.8);

  return tl;
}

/**
 * Enhanced Hero Scroll Transition Handler
 * Dynamically binds window scroll to move Hero typography upward and fade,
 * while allowing the canvas signal nodes inside HeroSignal to physically transform into
 * the flowing network stream leading smoothly into GroundToWorld (#ground-to-world).
 */
export function initHeroScrollTransition(
  heroContainer: HTMLElement,
  contentContainer: HTMLElement | null,
  signalContainer: HTMLElement | null
): () => void {
  let animationFrameId: number;

  const handleScroll = () => {
    animationFrameId = requestAnimationFrame(() => {
      const scrollY = window.scrollY;
      const heroHeight = heroContainer.offsetHeight || window.innerHeight;
      const scrollProgress = Math.min(Math.max(scrollY / (heroHeight * 0.85), 0), 1);

      if (scrollProgress > 0) {
        // Typography moves upward & fades out smoothly on scroll
        if (contentContainer) {
          contentContainer.style.transform = `translate3d(0, ${-scrollProgress * 110}px, 0)`;
          contentContainer.style.opacity = `${Math.max(0, 1 - scrollProgress * 1.3)}`;
        }

        // Signal container stays aligned while internal node engine handles physical morphing
        if (signalContainer) {
          signalContainer.style.transform = `translate3d(0, ${scrollProgress * 60}px, 0)`;
        }
      } else {
        if (contentContainer) {
          contentContainer.style.transform = 'translate3d(0, 0, 0)';
          contentContainer.style.opacity = '1';
        }
        if (signalContainer) {
          signalContainer.style.transform = 'translate3d(0, 0, 0)';
        }
      }
    });
  };

  window.addEventListener('scroll', handleScroll, { passive: true });

  return () => {
    window.removeEventListener('scroll', handleScroll);
    if (animationFrameId) cancelAnimationFrame(animationFrameId);
  };
}
