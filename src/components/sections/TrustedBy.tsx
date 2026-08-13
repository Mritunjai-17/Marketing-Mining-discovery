"use client";

import React from "react";

interface CompanyLogo {
  name: string;
  ticker: string;
  symbol: string;
}

const companyLogos: CompanyLogo[] = [
  { name: "Barrick Gold", ticker: "NYSE: GOLD", symbol: "BG" },
  { name: "Freeport-McMoRan", ticker: "NYSE: FCX", symbol: "FC" },
  { name: "Teck Resources", ticker: "TSX: TECK", symbol: "TR" },
  { name: "Filo Mining", ticker: "TSX: FILO", symbol: "FM" },
  { name: "Lundin Mining", ticker: "TSX: LUN", symbol: "LM" },
  { name: "Aura Minerals", ticker: "TSX: ORA", symbol: "AM" },
  { name: "Alamos Gold", ticker: "NYSE: AGI", symbol: "AG" },
  { name: "Anglo American", ticker: "LSE: AAL", symbol: "AA" },
  { name: "First Quantum", ticker: "TSX: FM", symbol: "FQ" },
  { name: "Pan American Silver", ticker: "NASDAQ: PAAS", symbol: "PA" },
  { name: "Capstone Copper", ticker: "TSX: CS", symbol: "CC" },
  { name: "Equinox Gold", ticker: "NYSE: EQX", symbol: "EG" },
  { name: "Osisko Gold", ticker: "NYSE: OR", symbol: "OG" },
  { name: "Lundin Gold", ticker: "TSX: LUG", symbol: "LG" },
  { name: "SSR Mining", ticker: "NASDAQ: SSRM", symbol: "SS" },
  { name: "Eldorado Gold", ticker: "NYSE: EGO", symbol: "EG" },
  { name: "Torex Gold", ticker: "TSX: TXG", symbol: "TG" },
  { name: "Kinross Gold", ticker: "NYSE: KGC", symbol: "KG" },
  { name: "Hudbay Minerals", ticker: "TSX: HBM", symbol: "HM" },
  { name: "Dundee Precious", ticker: "TSX: DPM", symbol: "DP" },
];

export const TrustedBy: React.FC = () => {
  const marqueeLogos = [...companyLogos, ...companyLogos];

  return (
    <section className="py-12 md:py-16 bg-[#F4F4F2] border-b border-[#E5E5E3] overflow-hidden font-sans">
      <div className="container-editorial mb-8 text-center">
        <p className="text-xs sm:text-sm font-semibold uppercase tracking-widest text-[#57595E]">
          Featured Mining Companies & Explorers
        </p>
      </div>

      {/* Infinite Auto-Scrolling Marquee Container */}
      <div className="relative w-full overflow-hidden">
        {/* Left & Right Gradient Fade Masks */}
        <div className="absolute top-0 left-0 bottom-0 w-16 sm:w-32 bg-gradient-to-r from-[#F4F4F2] to-transparent z-10 pointer-events-none" />
        <div className="absolute top-0 right-0 bottom-0 w-16 sm:w-32 bg-gradient-to-l from-[#F4F4F2] to-transparent z-10 pointer-events-none" />

        {/* Marquee Track */}
        <div className="animate-marquee gap-6 px-4">
          {marqueeLogos.map((logo, index) => (
            <div
              key={`${logo.name}-${index}`}
              className="group flex-shrink-0 bg-[#FAFAF9] border border-[#E5E5E3] hover:border-[#0B1F3A]/40 hover:bg-white rounded-md px-5 py-3.5 flex items-center gap-3 transition-all duration-300 grayscale hover:grayscale-0 cursor-pointer shadow-2xs hover:shadow-md"
            >
              {/* Emblem */}
              <div className="w-8 h-8 rounded bg-[#0B1F3A]/10 group-hover:bg-[#0B1F3A] text-[#0B1F3A] group-hover:text-[#B8860B] flex items-center justify-center font-serif text-xs font-normal transition-colors">
                {logo.symbol}
              </div>

              {/* Company Info */}
              <div className="flex flex-col text-left font-sans">
                <span className="font-serif text-sm font-normal text-[#1A1D21] group-hover:text-[#0B1F3A] transition-colors leading-tight whitespace-nowrap">
                  {logo.name}
                </span>
                <span className="font-mono text-[10px] text-[#57595E]/80 group-hover:text-[#B8860B] transition-colors uppercase tracking-wider">
                  {logo.ticker}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
