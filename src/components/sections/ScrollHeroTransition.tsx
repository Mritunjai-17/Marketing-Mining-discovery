"use client";

import React, { useRef, useEffect, useState } from "react";
import { motion, useScroll, useTransform, MotionStyle } from "framer-motion";

export interface HeroMotionStyles {
  heroStyle?: MotionStyle;
  buttonsStyle?: MotionStyle;
  globeStyle?: MotionStyle;
}

export interface ScrollHeroTransitionProps {
  renderHero: (motionStyles: HeroMotionStyles) => React.ReactNode;
  nextSection: React.ReactNode;
}

export const ScrollHeroTransition: React.FC<ScrollHeroTransitionProps> = ({
  renderHero,
  nextSection,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMobileOrReduced, setIsMobileOrReduced] = useState(false);

  useEffect(() => {
    const checkMediaQuery = () => {
      const isReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const isMobile = window.innerWidth < 768;
      setIsMobileOrReduced(isReduced || isMobile);
    };

    checkMediaQuery();
    window.addEventListener("resize", checkMediaQuery);
    return () => window.removeEventListener("resize", checkMediaQuery);
  }, []);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // DETERMINISTIC ONE-WAY SCROLL PROGRESSION (0.0 -> 1.0)
  // Stage 1: Hero text & CTAs move up and fade out (0.00 -> 0.35)
  const heroY = useTransform(scrollYProgress, [0, 0.35], ["0%", "-80%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.35], [1, 0]);

  const buttonsY = useTransform(scrollYProgress, [0, 0.30], ["0%", "-60%"]);
  const buttonsOpacity = useTransform(scrollYProgress, [0, 0.30], [1, 0]);

  // Stage 2: Globe scales up, rotates, and fades to 0 (0.20 -> 0.60)
  const globeScale = useTransform(scrollYProgress, [0, 0.60], [1, 1.35]);
  const globeX = useTransform(scrollYProgress, [0, 0.60], ["0%", "5%"]);
  const globeRotate = useTransform(scrollYProgress, [0, 1.00], [0, 30]);
  const globeOpacity = useTransform(scrollYProgress, [0.20, 0.60], [1, 0]);

  // Stage 3: Master hero dark background opacity fades out (0.40 -> 0.70)
  const masterHeroOpacity = useTransform(scrollYProgress, [0.40, 0.70], [1, 0]);

  // Hard pointer-events and visibility cutoff once HERO_COMPLETE is reached (progress >= 0.75 / 0.85)
  const pointerEvents = useTransform(scrollYProgress, (progress) =>
    progress >= 0.75 ? "none" : "auto"
  );
  const heroVisibility = useTransform(scrollYProgress, (progress) =>
    progress >= 0.85 ? "hidden" : "visible"
  );

  // Stage 4: Stats section (z-20) slides up smoothly over the pinned hero (0.40 -> 1.00)
  const nextSectionY = useTransform(scrollYProgress, [0.40, 1.00], ["40vh", "0vh"]);

  if (isMobileOrReduced) {
    return (
      <div className="relative">
        {renderHero({})}
        <div>{nextSection}</div>
      </div>
    );
  }

  return (
    <>
      {/* 180vh PINNED HERO TRANSITION CONTAINER */}
      <div ref={containerRef} className="relative h-[180vh]">
        {/* STICKY HERO VIEWPORT (Base dark navy canvas z-10) */}
        <div className="sticky top-0 h-screen overflow-hidden z-10 flex flex-col justify-center bg-[#0B1220]">

          {/* Master Hero Wrapper */}
          <motion.div
            style={{
              opacity: masterHeroOpacity,
              pointerEvents,
              visibility: heroVisibility,
            }}
            className="w-full h-full flex flex-col justify-center"
          >
            {renderHero({
              heroStyle: { y: heroY, opacity: heroOpacity },
              buttonsStyle: { y: buttonsY, opacity: buttonsOpacity },
              globeStyle: {
                scale: globeScale,
                x: globeX,
                rotate: globeRotate,
                opacity: globeOpacity,
              },
            })}
          </motion.div>
        </div>
      </div>

      {/* NEXT SECTION (STATS) — Z-20 OVERLAYS THE COMPLETED HERO SEAMLESSLY */}
      <motion.div
        style={{ y: nextSectionY }}
        className="relative z-20 bg-[#FBFBFA] -mt-[40vh]"
      >
        {nextSection}
      </motion.div>
    </>
  );
};
