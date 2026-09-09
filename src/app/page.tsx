import React from 'react';
import Hero from '@/components/hero/Hero';
import GroundToWorld from '@/components/sections/GroundToWorld';
import WhoWeAre from '@/components/sections/WhoWeAre';
import Journey from '@/components/sections/Journey';
import MissionVision from '@/components/sections/MissionVision';
import Services from '@/components/sections/Services';
import CoreAdvantage from '@/components/sections/CoreAdvantage';
import Impact from '@/components/sections/Impact';
import CaseStudies from '@/components/sections/CaseStudies';
import Portfolio from '@/components/sections/Portfolio';
import Network from '@/components/sections/Network';
import DigitalProducts from '@/components/sections/DigitalProducts';
import Media from '@/components/sections/Media';
import MarketingRecords from '@/components/sections/MarketingRecords';
import Team from '@/components/sections/Team';
import Insights from '@/components/sections/Insights';
import AskAI from '@/components/sections/AskAI';
import Contact from '@/components/sections/Contact';

export default function HomePage() {
  return (
    <div className="relative w-full flex flex-col bg-[#0B0D0E]">
      {/* Hero Experience (Phase 1 Structural Foundation) */}
      <Hero />

      {/* Scalable Architecture Sections */}
      <GroundToWorld />
      <WhoWeAre />
      <Journey />
      <MissionVision />
      <Services />
      <CoreAdvantage />
      <Impact />
      <CaseStudies />
      <Portfolio />
      <Network />
      <DigitalProducts />
      <Media />
      <MarketingRecords />
      <Team />
      <Insights />
      <AskAI />
      <Contact />
    </div>
  );
}
