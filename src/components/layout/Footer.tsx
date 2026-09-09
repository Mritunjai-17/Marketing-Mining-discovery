import React from 'react';
import Link from 'next/link';
import { SITE_CONFIG } from '@/lib/constants';

export default function Footer() {
  return (
    <footer className="w-full bg-[#08090A] border-t border-white/10 py-16 px-6 sm:px-8 lg:px-12 text-white/70">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <span className="font-serif text-xl tracking-wider text-white">MINING</span>
            <span className="font-mono text-xs tracking-[0.25em] text-[#C5A059]">DISCOVERY</span>
          </div>
          <p className="text-caption text-stone-400 max-w-sm">
            {SITE_CONFIG.tagline}
          </p>
        </div>

        <div className="flex flex-wrap gap-8 text-navigation text-xs text-stone-400">
          <Link href="#work" className="hover:text-white transition-colors">
            WORK
          </Link>
          <Link href="#services" className="hover:text-white transition-colors">
            SERVICES
          </Link>
          <Link href="#story" className="hover:text-white transition-colors">
            STORY
          </Link>
          <Link href="#insights" className="hover:text-white transition-colors">
            INSIGHTS
          </Link>
          <Link href="#contact" className="hover:text-[#C5A059] transition-colors">
            CONTACT
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center text-caption text-stone-500 text-[0.7rem] gap-4">
        <p>© {new Date().getFullYear()} Mining Discovery. All rights reserved.</p>
        <p>Premium Digital Media, Branding & Investor Engagement Agency</p>
      </div>
    </footer>
  );
}
