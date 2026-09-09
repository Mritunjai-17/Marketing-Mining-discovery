import React from 'react';
import SectionLabel from '@/components/ui/SectionLabel';
import { CLIENT_NETWORK } from '@/data/clients';

export default function Network() {
  return (
    <section id="network" className="w-full py-24 px-6 sm:px-8 lg:px-12 bg-[#090A0C] border-t border-white/5">
      <div className="max-w-7xl mx-auto">
        <SectionLabel number="11" title="NETWORK / CLIENTS" />
        <h2 className="text-display-lg font-serif text-white max-w-3xl mb-12">
          Global Producers & Explorers Connected to Capital.
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {CLIENT_NETWORK.map((c) => (
            <div key={c.id} className="p-6 bg-[#121417] border border-white/5 flex flex-col justify-between h-36">
              <div>
                <span className="text-caption text-[0.65rem] text-[#C5A059] uppercase">{c.tier}</span>
                <h3 className="font-serif text-lg text-white mt-1">{c.name}</h3>
              </div>
              <div className="text-caption text-stone-400 text-xs">
                {c.ticker ? `${c.exchange}: ${c.ticker}` : c.headquarters}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
