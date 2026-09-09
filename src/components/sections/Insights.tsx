import React from 'react';
import SectionLabel from '@/components/ui/SectionLabel';
import { INSIGHTS_ARTICLES } from '@/data/insights';

export default function Insights() {
  return (
    <section id="insights" className="w-full py-24 px-6 sm:px-8 lg:px-12 bg-[#0B0D0E] border-t border-white/5">
      <div className="max-w-7xl mx-auto">
        <SectionLabel number="16" title="INSIGHTS" />
        <h2 className="text-display-lg font-serif text-white max-w-3xl mb-12">
          Mining Capital & Media Intelligence.
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {INSIGHTS_ARTICLES.map((art) => (
            <div key={art.id} className="p-8 bg-[#121417] border border-white/5 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center text-caption text-stone-400 mb-4">
                  <span className="text-[#C5A059] uppercase tracking-wider">{art.category}</span>
                  <span>{art.readTime}</span>
                </div>
                <h3 className="font-serif text-xl text-white mb-3">{art.title}</h3>
                <p className="text-body text-sm text-stone-400">{art.excerpt}</p>
              </div>
              <div className="mt-6 pt-4 border-t border-white/5 text-caption text-[0.65rem] text-stone-500">
                {art.date}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
