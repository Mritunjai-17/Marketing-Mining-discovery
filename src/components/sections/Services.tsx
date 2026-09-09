import React from 'react';
import SectionLabel from '@/components/ui/SectionLabel';
import { CORE_SERVICES } from '@/data/services';

export default function Services() {
  return (
    <section id="services" className="w-full py-24 px-6 sm:px-8 lg:px-12 bg-[#0B0D0E] border-t border-white/5">
      <div className="max-w-7xl mx-auto">
        <SectionLabel number="06" title="SERVICES" />
        <h2 className="text-display-lg font-serif text-white max-w-3xl mb-12">
          Strategic Media, Branding & Investor Engagement Capabilities.
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {CORE_SERVICES.map((srv) => (
            <div key={srv.id} className="p-8 bg-[#121417] border border-white/5 hover:border-[#C5A059]/40 transition-colors">
              <span className="font-mono text-xs text-[#C5A059] mb-4 block">{srv.code}</span>
              <h3 className="text-heading text-white mb-3 font-serif">{srv.title}</h3>
              <p className="text-body text-stone-400 text-sm mb-6">{srv.description}</p>
              <ul className="space-y-2 border-t border-white/5 pt-4">
                {srv.capabilities.map((cap, i) => (
                  <li key={i} className="text-caption text-stone-300 flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-[#C5A059]" />
                    <span>{cap}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
