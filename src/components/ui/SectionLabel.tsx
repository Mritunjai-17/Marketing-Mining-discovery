import React from 'react';
import { cn } from '@/lib/utils';

interface SectionLabelProps {
  number: string;
  title: string;
  className?: string;
}

export default function SectionLabel({ number, title, className }: SectionLabelProps) {
  return (
    <div className={cn('inline-flex items-center gap-3 text-eyebrow mb-4', className)}>
      <span className="text-[#C5A059] font-mono font-medium tracking-widest">{number}</span>
      <span className="w-6 h-[1px] bg-[#C5A059]/40" />
      <span className="text-white/70 uppercase tracking-[0.22em] text-xs font-mono">{title}</span>
    </div>
  );
}
