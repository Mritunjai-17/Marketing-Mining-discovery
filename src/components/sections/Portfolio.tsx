import React from 'react';
import SectionLabel from '@/components/ui/SectionLabel';

export default function Portfolio() {
  return (
    <section id="portfolio" className="w-full py-24 px-6 sm:px-8 lg:px-12 bg-[#0B0D0E] border-t border-white/5">
      <div className="max-w-7xl mx-auto">
        <SectionLabel number="10" title="CREATIVE ARCHIVE / PORTFOLIO" />
        <h2 className="text-display-lg font-serif text-white max-w-3xl mb-6">
          Selected Digital Assets & Visual Works.
        </h2>
        <p className="text-body max-w-xl">
          An editorial archive of campaign assets, documentary reels, interactive models, and corporate re-branding initiatives.
        </p>
      </div>
    </section>
  );
}
