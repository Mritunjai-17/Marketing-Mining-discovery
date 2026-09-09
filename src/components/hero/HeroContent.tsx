'use client';

import React from 'react';
import SectionLabel from '@/components/ui/SectionLabel';
import HeroCTA from './HeroCTA';
import HeroNavigation from './HeroNavigation';

export default function HeroContent() {
  return (
    <div className="flex flex-col justify-between h-full z-10 space-y-8 lg:space-y-12">
      <div className="space-y-6 max-w-2xl">


        {/* Large Editorial Headline */}
        <h1 className="hero-headline text-display-xl font-serif text-white font-normal tracking-tight leading-[0.92]">
          Mining has <br />
          <span className="italic font-serif text-[#F4F4F0]/90">a story.</span>
        </h1>

        {/* Supporting Headline */}
        <p className="hero-supporting text-heading font-sans text-[#F4F4F0] font-light tracking-tight">
          We make the world see it.
        </p>

        {/* Supporting Description */}
        <p className="hero-description text-body text-stone-400 max-w-lg font-normal text-base sm:text-lg leading-relaxed">
          Media, branding and investor engagement built for the mining ecosystem.
        </p>

        {/* Primary & Secondary CTAs */}
        <div className="hero-cta pt-4 sm:pt-6">
          <HeroCTA />
        </div>
      </div>

      {/* Hero Bottom Bar Navigation / Telemetry */}
      <div className="hero-[#navigation]">
        <HeroNavigation />
      </div>
    </div>
  );
}

