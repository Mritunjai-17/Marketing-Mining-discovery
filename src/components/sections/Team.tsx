import React from 'react';
import SectionLabel from '@/components/ui/SectionLabel';

export default function Team() {
  return (
    <section id="team" className="w-full py-24 px-6 sm:px-8 lg:px-12 bg-[#090A0C] border-t border-white/5">
      <div className="max-w-7xl mx-auto">
        <SectionLabel number="15" title="TEAM" />
        <h2 className="text-display-lg font-serif text-white max-w-3xl mb-6">
          Multidisciplinary Executive Leadership.
        </h2>
        <p className="text-body max-w-xl">
          A core team combining award-winning creative directors, financial journalists, web architects, and resource capital strategists.
        </p>
      </div>
    </section>
  );
}
