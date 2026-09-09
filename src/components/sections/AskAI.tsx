'use client';

import React, { useState } from 'react';
import SectionLabel from '@/components/ui/SectionLabel';
import MagneticButton from '@/components/ui/MagneticButton';
import { Sparkles, Send } from 'lucide-react';

export default function AskAI() {
  const [query, setQuery] = useState('');

  const handleQuerySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    alert(`Mining Discovery AI Query Received: "${query}"\nAI engine integration will be activated in future updates.`);
    setQuery('');
  };

  return (
    <section id="ask-ai" className="w-full py-24 px-6 sm:px-8 lg:px-12 bg-[#090A0C] border-t border-white/5">
      <div className="max-w-4xl mx-auto text-center">
        <SectionLabel number="17" title="ASK MINING DISCOVERY AI" className="justify-center" />
        <h2 className="text-display-lg font-serif text-white mb-6">
          Query Our Resource Capital & Media Intelligence Engine.
        </h2>
        <p className="text-body max-w-xl mx-auto mb-10">
          Get real-time insights into market sentiment, digital media strategies, or institutional engagement benchmarks.
        </p>

        <form onSubmit={handleQuerySubmit} className="relative max-w-2xl mx-auto">
          <div className="relative flex items-center bg-[#121417] border border-white/15 focus-within:border-[#C5A059] rounded p-2 transition-colors">
            <Sparkles className="w-5 h-5 text-[#C5A059] ml-3 mr-2 shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask about critical mineral branding, investor engagement, or media strategy..."
              className="w-full bg-transparent text-white placeholder-stone-500 font-sans text-sm focus:outline-none px-2"
            />
            <MagneticButton type="submit" variant="primary" size="sm">
              <Send className="w-3.5 h-3.5" />
              <span>QUERY</span>
            </MagneticButton>
          </div>
        </form>
      </div>
    </section>
  );
}
