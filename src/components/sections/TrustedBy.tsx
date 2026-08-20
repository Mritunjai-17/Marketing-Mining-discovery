"use client";

import React, { useState } from "react";

interface Company {
  name: string;
  logo: string;
}

const companies: Company[] = [
  { name: "Arras Minerals", logo: "/companies/arras-minerals.png" },
  { name: "Afrikor", logo: "/companies/afrikor.png" },
  { name: "Arizona Gold & Silver", logo: "/companies/arizona-gold-silver.png" },
  { name: "Astra Exploration", logo: "/companies/astra-exploration.png" },
  { name: "Aurion Resources", logo: "/companies/aurion-resources.png" },
  { name: "Bluenergies", logo: "/companies/bluenergies.png" },
  { name: "Bactech", logo: "/companies/bactech.png" },
  { name: "Digipower X", logo: "/companies/digipower-x.png" },
  { name: "Gold Hunter Resources", logo: "/companies/gold-hunter-resources.png" },
  { name: "Golkor", logo: "/companies/golkor.png" },
  { name: "Guanajuato", logo: "/companies/guanajuato.png" },
  { name: "Harfang", logo: "/companies/harfang.png" },
  { name: "He Capital", logo: "/companies/he-capital.png" },
  { name: "Kodiak Copper", logo: "/companies/kodiak-copper.png" },
  { name: "Leviathan", logo: "/companies/leviathan.png" },
  { name: "Loyalist", logo: "/companies/loyalist.png" },
  { name: "Mining Investment Event", logo: "/companies/mining-investment-event.png" },
  { name: "Noble Plains", logo: "/companies/noble-plains.png" },
  { name: "Pan Global", logo: "/companies/pan-global.png" },
  { name: "Phenom Resources", logo: "/companies/phenom-resources.png" },
  { name: "Power Metallic", logo: "/companies/power-metallic.png" },
  { name: "SilverWolf", logo: "/companies/silverwolf.png" },
  { name: "Spacekor", logo: "/companies/spacekor.png" },
  { name: "US Gold", logo: "/companies/us-gold.png" },
  { name: "USDC", logo: "/companies/usdc.png" },
  { name: "Vivio Power", logo: "/companies/vivio-power.png" },
  { name: "West Red Lake", logo: "/companies/west-red-lake.png" },
];

/*
 * One marquee item. Renders the real logo when the PNG exists in /public/companies
 * and falls back to a plain text wordmark when it 404s, so dropping files into that
 * folder later swaps them in with no code change. Plain <img> rather than
 * next/image: the optimizer treats a missing local file as a hard error, while a
 * bare <img> just fires onError, which is exactly the signal we want.
 */
const CompanyLogo: React.FC<{ company: Company }> = ({ company }) => {
  const [logoAvailable, setLogoAvailable] = useState(true);

  return (
    <div className="mr-12 flex flex-shrink-0 items-center opacity-70 grayscale transition-all duration-300 ease-out hover:opacity-100 hover:grayscale-0">
      {logoAvailable ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={company.logo}
          alt={`${company.name} logo`}
          className="h-9 w-auto max-w-[170px] object-contain"
          onError={() => setLogoAvailable(false)}
        />
      ) : (
        <span className="whitespace-nowrap font-sans text-lg font-semibold tracking-tight text-[#57595E]">
          {company.name}
        </span>
      )}
    </div>
  );
};

export const TrustedBy: React.FC = () => {
  const marqueeCompanies = [...companies, ...companies];

  return (
    <section className="py-12 md:py-16 bg-[#F4F4F2] border-b border-[#E5E5E3] overflow-hidden font-sans">
      <div className="container-editorial mb-8 text-center">
        <p className="text-xs sm:text-sm font-semibold uppercase tracking-widest text-[#57595E]">
          Featured Mining Companies & Explorers
        </p>
      </div>

      {/* Infinite Auto-Scrolling Marquee Container */}
      <div className="marquee-viewport relative w-full overflow-x-hidden">
        {/* Left & Right Gradient Fade Masks */}
        <div className="absolute top-0 left-0 bottom-0 w-16 sm:w-32 bg-gradient-to-r from-[#F4F4F2] to-transparent z-10 pointer-events-none" />
        <div className="absolute top-0 right-0 bottom-0 w-16 sm:w-32 bg-gradient-to-l from-[#F4F4F2] to-transparent z-10 pointer-events-none" />

        {/* Marquee Track */}
        <div className="marquee-track flex w-max flex-row flex-nowrap items-center">
          {marqueeCompanies.map((company, index) => (
            <CompanyLogo key={`${company.name}-${index}`} company={company} />
          ))}
        </div>
      </div>
    </section>
  );
};
