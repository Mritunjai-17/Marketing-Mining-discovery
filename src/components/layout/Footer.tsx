import React from "react";
import Link from "next/link";

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-[#0B1F3A] text-white border-t border-[#061224] py-12 md:py-16 font-sans">
      <div className="container-editorial">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-white/10">
          <div>
            <Link href="/" className="font-serif text-2xl font-normal tracking-tight text-white">
              Mining Discovery<span className="text-[#B8860B]">.</span>
            </Link>
            <p className="font-sans text-xs text-[#F0F4F8]/70 mt-1 max-w-sm font-normal">
              The media, market intelligence, and news platform for global mining and metals companies.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-6 text-xs uppercase tracking-wider text-[#F0F4F8]/80 font-semibold font-sans">
            <Link href="#about" className="hover:text-[#B8860B] transition-colors">About</Link>
            <Link href="#services" className="hover:text-[#B8860B] transition-colors">Services</Link>
            <Link href="#trusted-by" className="hover:text-[#B8860B] transition-colors">Companies</Link>
            <Link href="#contact" className="hover:text-[#B8860B] transition-colors">Contact</Link>
          </div>
        </div>
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-[#F0F4F8]/50 gap-4 font-sans font-normal">
          <p>© {new Date().getFullYear()} Mining Discovery Media. All rights reserved.</p>
          <p className="text-[11px] font-mono">Editorial Intelligence System Scaffold</p>
        </div>
      </div>
    </footer>
  );
};
