"use client";

import React, { useEffect, useRef, useState } from "react";

interface StatItem {
  numericValue: number;
  suffix: string;
  prefix?: string;
  formatComma?: boolean;
  label: string;
  sublabel?: string;
}

const statsData: StatItem[] = [
  {
    numericValue: 150000,
    suffix: "+",
    formatComma: true,
    label: "Active Monthly Audience",
    sublabel: "Institutional & Industry Readers",
  },
  {
    numericValue: 40000,
    suffix: "+",
    formatComma: true,
    label: "Newsletter Subscribers",
    sublabel: "Weekly Executive Briefing",
  },
  {
    numericValue: 450,
    suffix: "+",
    label: "Mining Companies Featured",
    sublabel: "Explorers to Tier-1 Producers",
  },
  {
    numericValue: 8,
    suffix: "+",
    label: "Years Industry Coverage",
    sublabel: "Established Media Record",
  },
  {
    numericValue: 30,
    suffix: "+",
    label: "Mining Jurisdictions",
    sublabel: "Global Capital Hubs",
  },
];

const StatBlock: React.FC<{ item: StatItem; index: number }> = ({ item, index }) => {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const blockRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.25 }
    );

    if (blockRef.current) {
      observer.observe(blockRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    const end = item.numericValue;
    const duration = 1800; // ms
    const startTime = performance.now();

    const stepCounter = (currentTime: number) => {
      const elapsedTime = currentTime - startTime;
      const progress = Math.min(elapsedTime / duration, 1);
      
      const easeOutProgress = 1 - Math.pow(1 - progress, 3);
      const currentVal = Math.floor(easeOutProgress * end);

      setCount(currentVal);

      if (progress < 1) {
        requestAnimationFrame(stepCounter);
      } else {
        setCount(end);
      }
    };

    requestAnimationFrame(stepCounter);
  }, [isVisible, item.numericValue]);

  const formattedCount = item.formatComma
    ? count.toLocaleString("en-US")
    : count;

  return (
    <div
      ref={blockRef}
      className="flex flex-col items-center justify-center p-5 text-center font-sans"
    >
      {/* Technical Data Number in IBM Plex Mono */}
      <div className="font-mono text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#0B1F3A] mb-1.5">
        {item.prefix}
        {formattedCount}
        <span className="text-[#B8860B]">{item.suffix}</span>
      </div>

      {/* Label Underneath in Inter */}
      <div className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-[#1A1D21]">
        {item.label}
      </div>

      {/* Sublabel Context in Inter */}
      {item.sublabel && (
        <div className="text-[11px] text-[#57595E] mt-1 font-normal">
          {item.sublabel}
        </div>
      )}
    </div>
  );
};

export const Stats: React.FC = () => {
  return (
    <section className="bg-white border-y border-[#E5E5E3] py-10 md:py-14">
      <div className="container-editorial">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-y-8 gap-x-4">
          {statsData.map((stat, idx) => (
            <StatBlock key={stat.label} item={stat} index={idx} />
          ))}
        </div>
      </div>
    </section>
  );
};
