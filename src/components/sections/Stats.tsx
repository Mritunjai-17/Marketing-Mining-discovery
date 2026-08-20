"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

export interface StatItem {
  numericValue: number;
  valueDisplay: string;
  label: string;
  description: string;
}

const STATS_DATA: StatItem[] = [
  {
    numericValue: 150000,
    valueDisplay: "150,000+",
    label: "Active Monthly Audience",
    description: "Institutional investors, mining executives, and industry analysts reading market updates.",
  },
  {
    numericValue: 40000,
    valueDisplay: "40,000+",
    label: "Newsletter Subscribers",
    description: "Weekly executive briefing delivered directly to decision-maker inboxes worldwide.",
  },
  {
    numericValue: 450,
    valueDisplay: "450+",
    label: "Mining Companies Featured",
    description: "From junior exploration companies to Tier-1 global mining producers.",
  },
  {
    numericValue: 8,
    valueDisplay: "8+",
    label: "Years Industry Coverage",
    description: "Established track record of independent editorial authority and market intelligence.",
  },
  {
    numericValue: 30,
    valueDisplay: "30+",
    label: "Mining Jurisdictions",
    description: "Extensive reach across key financial capitals and global mining jurisdictions.",
  },
];

const RevealOnScroll: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = "",
}) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      } ${className}`}
    >
      {children}
    </div>
  );
};

export const Stats: React.FC = () => {
  return (
    <section className="relative bg-[#FBFBFA] text-[#1A1D21] border-b border-[#E5E4DE] font-sans">
      {/* Subtle Grain Overlay */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:16px_16px]" />

      {/* Main Container */}
      <div className="relative w-full max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-16 py-20 lg:py-28">
        <div className="flex flex-col lg:flex-row items-start gap-12 lg:gap-24">
          
          {/* LEFT COLUMN: Human Editorial Sticky Block */}
          <div className="w-full lg:w-5/12 lg:sticky lg:top-[120px]">
            <div className="flex flex-col items-start gap-6 lg:pr-6">
              
              {/* Subtle Gold Hairline Divider */}
              <div className="w-12 h-0.5 bg-[#B8860B]" />

              {/* Eyebrow Label */}
              <span className="text-xs font-semibold uppercase tracking-[0.15em] text-[#B8860B]">
                Market Influence & Reach
              </span>

              {/* Editorial Quote Headline */}
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-[44px] font-normal text-[#0B1F3A] leading-[1.15] tracking-[-0.015em]">
                "One platform. Every major mining audience."
              </h2>

              {/* Mining Editorial Feature Image */}
              <div className="w-full mt-2 rounded-xl overflow-hidden border border-[#E5E4DE] shadow-md relative group aspect-[16/10] max-h-[250px] sm:max-h-[270px]">
                <Image
                  src="/mining-stats.png"
                  alt="Mining Discovery Editorial Operations"
                  width={600}
                  height={375}
                  className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B1F3A]/30 via-transparent to-transparent opacity-40 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Natural Editorial Flow */}
          <div className="w-full lg:w-7/12 flex flex-col gap-14 lg:gap-16 lg:pl-10 border-t lg:border-t-0 lg:border-l border-[#E5E4DE] pt-12 lg:pt-0">
            
            {/* INTRO SENTENCE BLOCK (First item above 150,000+ with RevealOnScroll effect) */}
            <RevealOnScroll>
              <div className="pb-10 border-b border-[#E5E4DE]">
                <p className="text-xl sm:text-2xl text-[#3A3D42] leading-relaxed font-normal font-sans">
                  Mining Discovery bridges the gap between mining companies and the global investment community through targeted editorial coverage and market intelligence. Connecting global mining companies directly with institutional investors, analysts, and executive decision-makers.
                </p>
              </div>
            </RevealOnScroll>

            {/* STATS LIST (Clean Editorial Rows) */}
            <div className="flex flex-col gap-12 sm:gap-16">
              {STATS_DATA.map((stat) => {
                return (
                  <RevealOnScroll key={stat.label}>
                    <div className="group flex flex-col gap-2 pb-10 border-b border-[#E5E4DE] last:border-b-0">
                      
                      {/* Oversized Human Serif Stat Number */}
                      <div className="font-serif text-6xl sm:text-7xl lg:text-8xl font-normal text-[#0B1F3A] tracking-tight leading-none group-hover:text-[#B8860B] transition-colors duration-300">
                        {stat.valueDisplay}
                      </div>

                      {/* Clean Uppercase Label */}
                      <div className="text-xs sm:text-sm font-semibold uppercase tracking-[0.14em] text-[#B8860B] mt-2">
                        {stat.label}
                      </div>

                      {/* Natural Human Description */}
                      <p className="text-sm sm:text-base text-[#57595E] leading-relaxed font-normal max-w-lg mt-1">
                        {stat.description}
                      </p>

                    </div>
                  </RevealOnScroll>
                );
              })}
            </div>

            {/* EDITORIAL CALLOUT BLOCK (Exact Screenshot Design) */}
            <RevealOnScroll>
              <div className="flex flex-col gap-8 pt-4">
                
                {/* Paragraph 1 */}
                <p className="font-sans text-xl sm:text-2xl font-medium text-[#1A1D21] leading-snug sm:leading-snug max-w-xl">
                  With direct access to institutional investors and industry analysts, your company's news reaches the decision-makers who matter most in global mining.
                </p>

                {/* Paragraph 2 with Bullet Icon Circle */}
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full border border-[#D5D4CE] bg-white flex items-center justify-center text-[#1A1D21] text-xs font-bold shadow-xs mt-1">
                    •
                  </div>
                  <p className="font-sans text-xl sm:text-2xl font-medium text-[#1A1D21] leading-snug sm:leading-snug max-w-xl">
                    That means no fragmented messaging between channels. No news lost in handoffs. Just one dedicated team, accountable for reaching decision-makers worldwide.
                  </p>
                </div>

                {/* Pill Outline Button */}
                <div className="pt-2">
                  <Link
                    href="#about"
                    className="inline-flex items-center justify-center rounded-full border border-[#1A1D21]/30 hover:border-[#0B1F3A] hover:bg-[#0B1F3A] hover:text-white px-7 py-3 text-[11px] font-mono font-semibold tracking-wider uppercase text-[#1A1D21] transition-all duration-300 shadow-xs"
                  >
                    LEARN MORE ABOUT US
                  </Link>
                </div>

                {/* Bottom Tagline with Horizontal Divider Line */}
                <div className="pt-16">
                  <p className="text-sm font-medium text-[#1A1D21] tracking-wide mb-3">
                    From raw discoveries, market clarity emerges
                  </p>
                  <div className="w-full h-px bg-[#E5E4DE]" />
                </div>

              </div>
            </RevealOnScroll>

          </div>

        </div>
      </div>
    </section>
  );
};



