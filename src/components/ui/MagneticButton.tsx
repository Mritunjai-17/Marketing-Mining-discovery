'use client';

import React, { useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface MagneticButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  href?: string;
  className?: string;
}

export default function MagneticButton({
  children,
  variant = 'primary',
  size = 'md',
  href,
  className,
  ...props
}: MagneticButtonProps) {
  const buttonRef = useRef<HTMLButtonElement & HTMLAnchorElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const prefersReducedMotion = useReducedMotion();

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (prefersReducedMotion || !buttonRef.current) return;
    const { clientX, clientY } = e;
    const { left, top, width, height } = buttonRef.current.getBoundingClientRect();
    const x = (clientX - (left + width / 2)) * 0.35;
    const y = (clientY - (top + height / 2)) * 0.35;
    setPosition({ x, y });
  };

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
  };

  const baseStyles =
    'relative inline-flex items-center justify-center font-navigation uppercase tracking-[0.18em] transition-all duration-300 ease-out select-none cursor-pointer focus-visible:outline-none';

  const variantStyles = {
    primary:
      'bg-[#F4F4F0] text-[#0B0D0E] hover:bg-[#C5A059] hover:text-[#0B0D0E] border border-transparent shadow-sm',
    secondary:
      'bg-[#17191C] text-[#F4F4F0] hover:bg-[#23262B] border border-white/10 hover:border-white/20',
    ghost:
      'bg-transparent text-[#F4F4F0] hover:text-[#C5A059]',
    outline:
      'bg-transparent text-[#F4F4F0] border border-[#C5A059]/40 hover:border-[#C5A059] hover:bg-[#C5A059]/10',
  };

  const sizeStyles = {
    sm: 'px-4 py-2 text-[0.7rem]',
    md: 'px-6 py-3.5 text-xs',
    lg: 'px-8 py-4 text-xs',
  };

  const content = (
    <span
      className="relative z-10 flex items-center gap-2.5 transition-transform duration-200 ease-out"
      style={{
        transform: `translate3d(${position.x * 0.5}px, ${position.y * 0.5}px, 0)`,
      }}
    >
      {children}
    </span>
  );

  const styleProps = {
    style: {
      transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
    },
    onMouseMove: handleMouseMove,
    onMouseLeave: handleMouseLeave,
    className: cn(baseStyles, variantStyles[variant], sizeStyles[size], className),
  };

  if (href) {
    return (
      <a
        ref={buttonRef as any}
        href={href}
        {...styleProps}
      >
        {content}
      </a>
    );
  }

  return (
    <button
      ref={buttonRef as any}
      {...props}
      {...styleProps}
    >
      {content}
    </button>
  );
}
