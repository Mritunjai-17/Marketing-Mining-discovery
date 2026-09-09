'use client';

import { useMediaQuery } from './useMediaQuery';

/**
 * Custom hook to detect user preference for reduced motion.
 * Ensures accessibility compliance across all animated components.
 */
export function useReducedMotion(): boolean {
  return useMediaQuery('(prefers-reduced-motion: reduce)');
}
