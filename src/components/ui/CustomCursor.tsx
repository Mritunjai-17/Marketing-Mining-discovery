'use client';

import React, { useEffect, useState } from 'react';
import { useMousePosition } from '@/hooks/useMousePosition';
import { useReducedMotion } from '@/hooks/useReducedMotion';

export default function CustomCursor() {
  const { x, y } = useMousePosition();
  const prefersReducedMotion = useReducedMotion();
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    // Only show custom cursor on non-touch devices
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (!isTouchDevice && !prefersReducedMotion) {
      setIsVisible(true);
    }

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target &&
        (target.tagName === 'A' ||
          target.tagName === 'BUTTON' ||
          target.closest('a') ||
          target.closest('button') ||
          target.getAttribute('role') === 'button' ||
          target.classList.contains('interactive'))
      ) {
        setIsHovered(true);
      } else {
        setIsHovered(false);
      }
    };

    window.addEventListener('mouseover', handleMouseOver);
    return () => window.removeEventListener('mouseover', handleMouseOver);
  }, [prefersReducedMotion]);

  if (!isVisible || prefersReducedMotion) return null;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden"
      aria-hidden="true"
    >
      {/* Precision center dot */}
      <div
        className="fixed top-0 left-0 w-1.5 h-1.5 bg-[#C5A059] rounded-full transition-transform duration-75 ease-out -translate-x-1/2 -translate-y-1/2"
        style={{
          transform: `translate3d(${x}px, ${y}px, 0) scale(${isHovered ? 2.5 : 1})`,
        }}
      />
      {/* Smooth outer ring */}
      <div
        className={`fixed top-0 left-0 rounded-full border border-[#C5A059]/40 transition-all duration-300 ease-out -translate-x-1/2 -translate-y-1/2 ${
          isHovered ? 'w-10 h-10 border-[#C5A059] bg-[#C5A059]/10' : 'w-6 h-6'
        }`}
        style={{
          transform: `translate3d(${x}px, ${y}px, 0)`,
        }}
      />
    </div>
  );
}
