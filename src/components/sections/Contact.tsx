'use client';

import React, { useState } from 'react';
import SectionLabel from '@/components/ui/SectionLabel';
import MagneticButton from '@/components/ui/MagneticButton';
import { ArrowUpRight } from 'lucide-react';
import { SITE_CONFIG } from '@/lib/constants';

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <section id="contact" className="w-full py-24 px-6 sm:px-8 lg:px-12 bg-[#0B0D0E] border-t border-white/5">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-5">
          <SectionLabel number="18" title="CONTACT" />
          <h2 className="text-display-lg font-serif text-white mb-6">
            Initiate Strategic Media Engagement.
          </h2>
          <p className="text-body mb-8">
            Ready to elevate your mining brand or capital markets presence? Connect directly with our strategic team.
          </p>
          <div className="space-y-4 text-caption text-stone-400">
            <div>
              <span className="block text-stone-500">DIRECT INQUIRIES</span>
              <a href={`mailto:${SITE_CONFIG.contactEmail}`} className="text-white hover:text-[#C5A059] transition-colors">
                {SITE_CONFIG.contactEmail}
              </a>
            </div>
            <div>
              <span className="block text-stone-500">GLOBAL HEADQUARTERS</span>
              <span className="text-stone-300">Vancouver // Toronto // Perth // London</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 bg-[#121417] p-8 sm:p-12 border border-white/5">
          {submitted ? (
            <div className="py-12 text-center space-y-4">
              <span className="w-3 h-3 rounded-full bg-[#C5A059] inline-block animate-ping" />
              <h3 className="font-serif text-2xl text-white">Engagement Request Received</h3>
              <p className="text-body text-sm text-stone-400 max-w-md mx-auto">
                Our strategic advisory team will review your inquiry and connect with your executive office within 24 hours.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-caption text-stone-400 mb-2 uppercase">Your Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Executive Name"
                    className="w-full bg-[#0B0D0E] border border-white/10 focus:border-[#C5A059] p-3 text-white text-sm focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-caption text-stone-400 mb-2 uppercase">Company / Ticker</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Copper Corp (TSX: CC)"
                    className="w-full bg-[#0B0D0E] border border-white/10 focus:border-[#C5A059] p-3 text-white text-sm focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-caption text-stone-400 mb-2 uppercase">Work Email</label>
                <input
                  type="email"
                  required
                  placeholder="executive@company.com"
                  className="w-full bg-[#0B0D0E] border border-white/10 focus:border-[#C5A059] p-3 text-white text-sm focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-caption text-stone-400 mb-2 uppercase">Objective / Scope</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Tell us about your upcoming capital raise, brand initiative, or media strategy requirements..."
                  className="w-full bg-[#0B0D0E] border border-white/10 focus:border-[#C5A059] p-3 text-white text-sm focus:outline-none resize-none"
                />
              </div>

              <MagneticButton type="submit" variant="primary" size="lg" className="w-full">
                <span>SUBMIT STRATEGIC INQUIRY</span>
                <ArrowUpRight className="w-4 h-4" />
              </MagneticButton>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
