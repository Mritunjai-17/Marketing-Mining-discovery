import React from 'react';
import SectionLabel from '@/components/ui/SectionLabel';

export default function Media() {
  return (
    <section id="media" className="w-full py-24 px-6 sm:px-8 lg:px-12 bg-[#090A0C] border-t border-white/5">
      <div className="max-w-7xl mx-auto">
        <SectionLabel number="13" title="MEDIA / PUBLICATIONS" />
        <h2 className="text-display-lg font-serif text-white max-w-3xl mb-6">
          Global Financial & Industry Editorial Distribution.
        </h2>
        <p className="text-body max-w-xl">
          Publishing high-impact mining documentaries, executive video podcasts, and technical asset reviews across tier-1 business and resource media networks.
        </p>
      </div>
    </section>
  );
}
