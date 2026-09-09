import React from 'react';
import SectionLabel from '@/components/ui/SectionLabel';

export default function CoreAdvantage() {
  return (
    <section id="core-advantage" className="w-full py-24 px-6 sm:px-8 lg:px-12 bg-[#090A0C] border-t border-white/5">
      <div className="max-w-7xl mx-auto">
        <SectionLabel number="07" title="CORE ADVANTAGE" />
        <h2 className="text-display-lg font-serif text-white max-w-3xl mb-8">
          Why Top Mining Corporations Choose Mining Discovery.
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { title: '70% Creative Mastery', desc: 'Agency-grade branding and documentary storytelling.' },
            { title: '15% Editorial Rigor', desc: 'Journalistic integrity and institutional media network.' },
            { title: '15% Geological Tech', desc: 'Deep technical understanding of drill assays & NI 43-101.' },
            { title: 'Institutional Network', desc: 'Direct reach into global fund managers & family offices.' },
          ].map((item, index) => (
            <div key={index} className="p-6 bg-[#121417] border border-white/5">
              <h3 className="font-serif text-xl text-white mb-2">{item.title}</h3>
              <p className="text-caption text-stone-400">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
