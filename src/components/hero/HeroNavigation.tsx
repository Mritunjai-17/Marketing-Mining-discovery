'use client';

import React from 'react';
import { ArrowDown } from 'lucide-react';

export default function HeroNavigation() {
  const scrollToNext = () => {
    const nextSection = document.getElementById('ground-to-world');
    if (nextSection) {
      nextSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="hero-navigation flex items-center justify-between pt-8 sm:pt-10 border-t border-white/10 w-full text-caption">
      <div className="flex items-center gap-3">
        <span className="w-2 h-2 rounded-full bg-[#C5A059] animate-pulse" />
        <span className="text-[0.65rem] sm:text-xs uppercase tracking-widest text-stone-400 font-mono">
          SIGNAL ACTIVE // MD-SYS.01
        </span>
      </div>

      <button
        onClick={scrollToNext}
        className="group flex items-center gap-3 text-[0.65rem] sm:text-xs uppercase tracking-widest text-stone-400 hover:text-white transition-colors focus-visible:outline-none cursor-pointer"
        aria-label="Scroll to next section"
      >
        <span>DISCOVER</span>
        <div className="w-7 h-7 rounded-full border border-white/15 flex items-center justify-center group-hover:border-[#C5A059] group-hover:text-[#C5A059] transition-all duration-300">
          <ArrowDown className="w-3.5 h-3.5 group-hover:translate-y-0.5 transition-transform duration-300" />
        </div>
      </button>
    </div>
  );
}

