import React from 'react';
import SectionLabel from '@/components/ui/SectionLabel';

export default function Journey() {
  return (
    <section id="journey" className="w-full py-24 px-6 sm:px-8 lg:px-12 bg-[#0B0D0E] border-t border-white/5">
      <div className="max-w-7xl mx-auto">
        <SectionLabel number="04" title="COMPANY JOURNEY" />
        <h2 className="text-display-lg font-serif text-white max-w-3xl mb-6">
          Architecting the Future of Resource Media.
        </h2>
        <p className="text-body max-w-xl">
          From pioneering digital investor hubs to launching multi-jurisdictional media campaigns across North America, Europe, and Australia.
        </p>
      </div>
    </section>
  );
}
