'use client';

import React, { useEffect, useRef } from 'react';
import HeroContent from './HeroContent';
import HeroSignal from './HeroSignal';
import { initHeroEntrance, initHeroScrollTransition } from '@/lib/animations/heroAnimations';
import { useReducedMotion } from '@/hooks/useReducedMotion';

export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const signalRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion || !containerRef.current) return;

    // Entrance Animation Timeline
    const ctx = initHeroEntrance(containerRef.current, {
      eyebrow: containerRef.current.querySelector('.hero-eyebrow'),
      headline: containerRef.current.querySelector('.hero-headline'),
      supporting: containerRef.current.querySelector('.hero-supporting'),
      description: containerRef.current.querySelector('.hero-description'),
      cta: containerRef.current.querySelector('.hero-cta'),
      signal: containerRef.current.querySelector('.hero-signal-container'),
      navigation: containerRef.current.querySelector('.hero-navigation'),
    });

    // Scroll Transition Listener
    const cleanupScroll = initHeroScrollTransition(
      containerRef.current,
      contentRef.current,
      signalRef.current
    );

    return () => {
      ctx.kill();
      cleanupScroll();
    };
  }, [prefersReducedMotion]);

  return (
    <section
      ref={containerRef}
      className="relative w-full min-h-screen pt-28 pb-16 lg:pt-32 lg:pb-20 flex items-center justify-center overflow-hidden bg-[#0B0D0E]"
      id="hero"
    >
      {/* Background Ambient Radial Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(197,160,89,0.06)_0%,rgba(11,13,14,1)_75%)] pointer-events-none z-0" />

      {/* Grid Container (~45% / ~55% Composition) */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 w-full grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-6 items-center relative z-10">
        {/* Left Side: Editorial Typography & Copy (lg:col-span-5) */}
        <div
          ref={contentRef}
          className="lg:col-span-5 order-1 flex flex-col justify-center transition-transform duration-75 ease-out"
        >
          <HeroContent />
        </div>

        {/* Right Side: The Signal Interactive Visualization (lg:col-span-7) */}
        <div
          ref={signalRef}
          className="lg:col-span-7 order-2 hero-signal-container w-full relative transition-transform duration-75 ease-out min-w-0"
        >
          <HeroSignal className="w-full h-full min-w-0" />
        </div>
      </div>
    </section>
  );
}
