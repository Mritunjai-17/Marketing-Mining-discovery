import React from 'react';
import SectionLabel from '@/components/ui/SectionLabel';

export default function GroundToWorld() {
  return (
    <section id="ground-to-world" className="w-full py-24 px-6 sm:px-8 lg:px-12 bg-[#0B0D0E] border-t border-white/5">
      <div className="max-w-7xl mx-auto">
        <SectionLabel number="02" title="FROM THE GROUND TO THE WORLD" />
        <h2 className="text-display-lg font-serif text-white max-w-3xl mb-6">
          Bridging Earth’s Resources with Global Capital Markets.
        </h2>
        <p className="text-body max-w-2xl">
          We translate raw geological discovery, technical feasibility, and ESG commitment into powerful, market-moving digital narratives.
        </p>
      </div>
    </section>
  );
}
