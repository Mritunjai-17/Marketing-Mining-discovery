import React from 'react';
import SectionLabel from '@/components/ui/SectionLabel';
import { FEATURED_PROJECTS } from '@/data/projects';

export default function CaseStudies() {
  return (
    <section id="case-studies" className="w-full py-24 px-6 sm:px-8 lg:px-12 bg-[#090A0C] border-t border-white/5">
      <div className="max-w-7xl mx-auto">
        <SectionLabel number="09" title="CASE STUDIES" />
        <h2 className="text-display-lg font-serif text-white max-w-3xl mb-12">
          Featured Brand & Investor Campaigns.
        </h2>
        <div className="space-y-8">
          {FEATURED_PROJECTS.map((proj) => (
            <div key={proj.id} className="p-8 bg-[#121417] border border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <span className="text-eyebrow text-xs mb-2 block">{proj.category} — {proj.client}</span>
                <h3 className="text-heading text-white font-serif mb-2">{proj.title}</h3>
                <p className="text-body text-sm max-w-2xl">{proj.summary}</p>
              </div>
              <div className="flex gap-4">
                {proj.metrics?.map((m, idx) => (
                  <div key={idx} className="text-right">
                    <div className="font-serif text-xl text-[#C5A059]">{m.value}</div>
                    <div className="text-caption text-[0.65rem] text-stone-400">{m.label}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
