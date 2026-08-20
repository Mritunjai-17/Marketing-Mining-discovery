"use client";

// Imported per-module rather than through the sections barrel: the barrel also re-exports
// WorldMapHero, which statically imports the world-atlas TopoJSON and would land in this
// page's bundle even though nothing here renders it.
import { GlobeHero } from "@/components/sections/GlobeHero";
import { Stats } from "@/components/sections/Stats";
import { TrustedBy } from "@/components/sections/TrustedBy";
import { ServicesScrollStory } from "@/components/sections/ServicesScrollStory";

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#F2F2F0]">
      {/* ROTATING HEMISPHERE HERO */}
      <GlobeHero />

      {/* FOLLOWING SECTIONS (STATS, TRUSTED BY, SERVICES) */}
      <div className="relative z-20 bg-[#FBFBFA]">
        <Stats />
      </div>
      <TrustedBy />
      <ServicesScrollStory />
    </div>
  );
}
