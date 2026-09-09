import React from 'react';
import SectionLabel from '@/components/ui/SectionLabel';

export default function Impact() {
  return (
    <section id="impact" className="w-full py-24 px-6 sm:px-8 lg:px-12 bg-[#0B0D0E] border-t border-white/5">
      <div className="max-w-7xl mx-auto">
        <SectionLabel number="08" title="IMPACT & RESULTS" />
        <h2 className="text-display-lg font-serif text-white max-w-3xl mb-12">
          Measurable Market Capital & Reach Generation.
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 border-y border-white/10 py-12">
          {[
            { metric: '$450M+', label: 'Attributed Capital Inflow' },
            { metric: '18M+', label: 'Global Media Views' },
            { metric: '45+', label: 'Mining Clients Represented' },
            { metric: '14', label: 'Global Market Jurisdictions' },
          ].map((stat, i) => (
            <div key={i} className="flex flex-col">
              <span className="font-serif text-4xl lg:text-5xl text-[#C5A059] mb-2">{stat.metric}</span>
              <span className="text-caption text-stone-400">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
