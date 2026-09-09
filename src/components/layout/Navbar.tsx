'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, Sparkles } from 'lucide-react';
import MagneticButton from '@/components/ui/MagneticButton';
import { NAV_LINKS, NAV_ACTIONS } from '@/lib/constants';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-[#0B0D0E]/85 backdrop-blur-md border-b border-white/5 py-4 shadow-xl'
          : 'bg-transparent py-6'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 flex items-center justify-between">
        {/* LEFT: Compact Editorial Logo */}
        <Link
          href="/"
          className="group flex items-center gap-3 focus-visible:outline-none"
          aria-label="Mining Discovery - Home"
        >
          <div className="w-2 h-2 rounded-full bg-[#C5A059] group-hover:scale-150 transition-transform duration-300" />
          <div className="flex flex-col leading-none">
            <span className="font-serif text-base tracking-wider text-white group-hover:text-[#C5A059] transition-colors">
              MINING
            </span>
            <span className="font-mono text-[0.65rem] tracking-[0.25em] text-[#C5A059] font-medium">
              DISCOVERY
            </span>
          </div>
        </Link>

        {/* CENTER / RIGHT: Desktop Navigation Links */}
        <nav
          className="hidden md:flex items-center gap-8 lg:gap-10"
          aria-label="Main Navigation"
        >
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-navigation text-white/75 hover:text-white transition-colors duration-200 relative py-1 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1px] after:bg-[#C5A059] hover:after:w-full after:transition-all after:duration-300"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* FAR RIGHT: Actions (ASK AI & CONTACT) */}
        <div className="hidden md:flex items-center gap-4">
          <Link
            href="#ask-ai"
            className="inline-flex items-center gap-2 text-navigation text-xs text-[#C5A059] hover:text-white transition-colors px-3 py-2 rounded border border-[#C5A059]/20 hover:border-[#C5A059]/50"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
            <span>ASK AI</span>
          </Link>

          <MagneticButton href="#contact" variant="primary" size="sm">
            CONTACT
          </MagneticButton>
        </div>

        {/* MOBILE MENU TOGGLE */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-white/80 hover:text-white focus-visible:outline-none"
          aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* MOBILE OVERLAY NAVIGATION */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-x-0 top-[70px] bg-[#0B0D0E]/95 backdrop-blur-xl border-b border-white/10 px-6 py-8 flex flex-col gap-6 shadow-2xl transition-all">
          <nav className="flex flex-col gap-5">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-navigation text-sm text-white/90 hover:text-[#C5A059] transition-colors py-2 border-b border-white/5"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="flex flex-col gap-3 pt-2">
            <Link
              href="#ask-ai"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 text-navigation text-xs text-[#C5A059] border border-[#C5A059]/30 py-3 rounded text-center"
            >
              <Sparkles className="w-4 h-4" />
              <span>ASK MINING DISCOVERY AI</span>
            </Link>
            <MagneticButton
              href="#contact"
              variant="primary"
              size="md"
              className="w-full text-center"
              onClick={() => setMobileMenuOpen(false)}
            >
              CONTACT US
            </MagneticButton>
          </div>
        </div>
      )}
    </header>
  );
}
