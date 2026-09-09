import React from 'react';
import SectionLabel from '@/components/ui/SectionLabel';

export default function MissionVision() {
  return (
    <section id="mission-vision" className="w-full py-24 px-6 sm:px-8 lg:px-12 bg-[#090A0C] border-t border-white/5">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="p-8 rounded border border-white/5 bg-[#121417]/50">
          <SectionLabel number="05.A" title="OUR MISSION" />
          <h3 className="text-heading font-serif text-white mb-4">Redefining Perception</h3>
          <p className="text-body text-stone-400">
            To equip mining and critical mineral pioneers with world-class digital media, branding, and investor engagement tools.
          </p>
        </div>
        <div className="p-8 rounded border border-white/5 bg-[#121417]/50">
          <SectionLabel number="05.B" title="OUR VISION" />
          <h3 className="text-heading font-serif text-white mb-4">The Global Benchmark</h3>
          <p className="text-body text-stone-400">
            To become the premier global digital authority and storytelling engine for the energy transition and mining ecosystem.
          </p>
        </div>
      </div>
    </section>
  );
}
