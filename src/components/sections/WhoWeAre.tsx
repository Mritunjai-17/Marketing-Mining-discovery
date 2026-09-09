import React from 'react';
import SectionLabel from '@/components/ui/SectionLabel';

export default function WhoWeAre() {
  return (
    <section id="who-we-are" className="w-full py-24 px-6 sm:px-8 lg:px-12 bg-[#090A0C] border-t border-white/5">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-5">
          <SectionLabel number="03" title="WHO WE ARE" />
          <h2 className="text-display-lg font-serif text-white mb-6">
            The Media & Branding Partner for Modern Mining Leaders.
          </h2>
        </div>
        <div className="lg:col-span-7 flex flex-col justify-center space-y-6">
          <p className="text-body">
            Mining Discovery is positioned at the intersection of high-end creative agency, global financial intelligence, and resource domain expertise.
          </p>
          <p className="text-body">
            We are not traditional corporate consultants. We are filmmakers, strategists, software architects, and brand developers elevating resource companies to institutional prominence.
          </p>
        </div>
      </div>
    </section>
  );
}
