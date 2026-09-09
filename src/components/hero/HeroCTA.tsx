'use client';

import React from 'react';
import MagneticButton from '@/components/ui/MagneticButton';
import { ArrowUpRight, Sparkles } from 'lucide-react';

interface HeroCTAProps {
  primaryLabel?: string;
  primaryHref?: string;
  secondaryLabel?: string;
  secondaryHref?: string;
  className?: string;
}

export default function HeroCTA({
  primaryLabel = 'Explore our work',
  primaryHref = '#portfolio',
  secondaryLabel = 'Ask Mining Discovery',
  secondaryHref = '#ask-ai',
  className = '',
}: HeroCTAProps) {
  return (
    <div className={`flex flex-wrap items-center gap-4 sm:gap-6 ${className}`}>
      {/* Primary CTA */}
      <MagneticButton href={primaryHref} variant="primary" size="lg" className="group">
        <span className="font-medium tracking-wider">{primaryLabel}</span>
        <ArrowUpRight className="w-4 h-4 text-[#0B0D0E] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300 ease-out" />
      </MagneticButton>

      {/* Secondary Subtle CTA */}
      <MagneticButton href={secondaryHref} variant="ghost" size="lg" className="group text-stone-300 hover:text-white border border-white/10 hover:border-[#C5A059]/40 bg-white/[0.02]">
        <Sparkles className="w-3.5 h-3.5 text-[#C5A059] opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300" />
        <span className="font-normal text-xs tracking-wider">{secondaryLabel}</span>
      </MagneticButton>
    </div>
  );
}

