"use client";

import { Hero, Stats, TrustedBy, ServicesScrollStory, ScrollHeroTransition } from "@/components/sections";

export default function Home() {
  return (
    <div>
      <ScrollHeroTransition
        renderHero={(motionStyles) => <Hero {...motionStyles} />}
        nextSection={<Stats />}
      />
      <TrustedBy />
      <ServicesScrollStory />
    </div>
  );
}
