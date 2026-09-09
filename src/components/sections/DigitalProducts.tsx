import React from 'react';
import SectionLabel from '@/components/ui/SectionLabel';

export default function DigitalProducts() {
  return (
    <section id="digital-products" className="w-full py-24 px-6 sm:px-8 lg:px-12 bg-[#0B0D0E] border-t border-white/5">
      <div className="max-w-7xl mx-auto">
        <SectionLabel number="12" title="DIGITAL PRODUCTS" />
        <h2 className="text-display-lg font-serif text-white max-w-3xl mb-6">
          Proprietary Engagement & Valuation Platforms.
        </h2>
        <p className="text-body max-w-xl">
          Custom interactive tools built for investors, board members, and analysts — including real-time drill result visualizers and digital cap table hubs.
        </p>
      </div>
    </section>
  );
}
