import React from 'react';
import SectionLabel from '@/components/ui/SectionLabel';

export default function MarketingRecords() {
  return (
    <section id="marketing-records" className="w-full py-24 px-6 sm:px-8 lg:px-12 bg-[#0B0D0E] border-t border-white/5">
      <div className="max-w-7xl mx-auto">
        <SectionLabel number="14" title="MARKETING RECORDS" />
        <h2 className="text-display-lg font-serif text-white max-w-3xl mb-6">
          Verified Campaign Benchmarks.
        </h2>
        <p className="text-body max-w-xl">
          Audited engagement metrics across global mining summits, digital roadshows, and capital raise initiatives.
        </p>
      </div>
    </section>
  );
}
