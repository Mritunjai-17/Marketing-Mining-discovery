"use client";

import React, { useEffect, useState } from "react";

export interface ConnectionArcsProps {
  className?: string;
  disabled?: boolean;
}

interface LocationTag {
  id: string;
  name: string;
  x: number;
  y: number;
  color: string;
}

const locationTags: LocationTag[] = [
  {
    id: "perth",
    name: "PERTH",
    x: 190,
    y: 405,
    color: "#D4AF37",
  },
  {
    id: "toronto",
    name: "TORONTO",
    x: 335,
    y: 200,
    color: "#D4AF37",
  },
  {
    id: "santiago",
    name: "SANTIAGO",
    x: 500,
    y: 445,
    color: "#D4AF37",
  },
  {
    id: "johannesburg",
    name: "JOHANNESBURG",
    x: 410,
    y: 365,
    color: "#FFFFFF",
  },
];

export const ConnectionArcs: React.FC<ConnectionArcsProps> = ({
  className = "",
  disabled = false,
}) => {
  const [loaded, setLoaded] = useState(false);
  const [hoveredTag, setHoveredTag] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 200);
    return () => clearTimeout(timer);
  }, []);

  if (disabled) return null;

  return (
    <div
      className={`absolute inset-0 pointer-events-none z-10 flex items-center justify-center ${className}`}
    >
      <div className="relative w-[680px] h-[680px]">
        {/* LINE TYPE 1 & 2: Dashed Orbit Ring + Hub-to-Hub Connection Arcs */}
        <svg
          className="w-full h-full overflow-visible"
          viewBox="0 0 680 680"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="goldArcGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.85" />
              <stop offset="60%" stopColor="#B8860B" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#D4AF37" stopOpacity="0.15" />
            </linearGradient>

            <linearGradient id="goldArcGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
              <stop offset="50%" stopColor="#D4AF37" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#B8860B" stopOpacity="0.2" />
            </linearGradient>
          </defs>

          {/* LINE TYPE 1: Dashed Gold Ellipse (Decorative Orbit Ring) */}
          <ellipse
            cx="340"
            cy="340"
            rx="295"
            ry="120"
            stroke="#D4AF37"
            strokeWidth="1.2"
            strokeOpacity="0.35"
            strokeDasharray="6 3"
            transform="rotate(-15 340 340)"
          />

          {/* DECORATIVE ORBIT DOTS ON DASHED RING */}
          <circle cx="70" cy="310" r="2.5" fill="#D4AF37" opacity="0.5" />
          <circle cx="610" cy="370" r="2.5" fill="#D4AF37" opacity="0.5" />
          <circle cx="240" cy="225" r="2" fill="#FFFFFF" opacity="0.45" />

          {/* LINE TYPE 2: HUB CONNECTION ARCS */}
          
          {/* Arc 1: Perth -> Toronto */}
          <path
            d="M 190 405 Q 230 230 335 200"
            stroke="url(#goldArcGrad1)"
            strokeWidth="1.5"
            strokeLinecap="round"
            className={`transition-all duration-1000 ${
              loaded ? "opacity-60" : "opacity-0"
            }`}
            style={{
              strokeDasharray: "300",
              strokeDashoffset: loaded ? "0" : "300",
              transition: "stroke-dashoffset 1.8s cubic-bezier(0.16, 1, 0.3, 1) 0.3s, opacity 0.5s ease",
            }}
          />

          {/* Arc 2: Toronto -> Santiago */}
          <path
            d="M 335 200 Q 470 260 500 445"
            stroke="url(#goldArcGrad2)"
            strokeWidth="1.5"
            strokeLinecap="round"
            className={`transition-all duration-1000 ${
              loaded ? "opacity-60" : "opacity-0"
            }`}
            style={{
              strokeDasharray: "350",
              strokeDashoffset: loaded ? "0" : "350",
              transition: "stroke-dashoffset 2s cubic-bezier(0.16, 1, 0.3, 1) 0.8s, opacity 0.5s ease",
            }}
          />

          {/* Arc 3: Santiago -> Johannesburg */}
          <path
            d="M 500 445 Q 440 475 410 365"
            stroke="url(#goldArcGrad1)"
            strokeWidth="1.5"
            strokeLinecap="round"
            className={`transition-all duration-1000 ${
              loaded ? "opacity-60" : "opacity-0"
            }`}
            style={{
              strokeDasharray: "250",
              strokeDashoffset: loaded ? "0" : "250",
              transition: "stroke-dashoffset 1.6s cubic-bezier(0.16, 1, 0.3, 1) 1.3s, opacity 0.5s ease",
            }}
          />

          {/* Arc 4: Johannesburg -> Perth */}
          <path
            d="M 410 365 Q 290 455 190 405"
            stroke="url(#goldArcGrad2)"
            strokeWidth="1.5"
            strokeLinecap="round"
            className={`transition-all duration-1000 ${
              loaded ? "opacity-60" : "opacity-0"
            }`}
            style={{
              strokeDasharray: "280",
              strokeDashoffset: loaded ? "0" : "280",
              transition: "stroke-dashoffset 1.7s cubic-bezier(0.16, 1, 0.3, 1) 1.7s, opacity 0.5s ease",
            }}
          />

          {/* Traveling Light Pulses Along Connection Arcs */}
          {loaded && (
            <>
              <circle r="2.5" fill="#D4AF37" className="animate-ping opacity-75">
                <animateMotion
                  path="M 190 405 Q 230 230 335 200"
                  dur="4s"
                  repeatCount="indefinite"
                />
              </circle>
              <circle r="2.5" fill="#FFFFFF" className="animate-ping opacity-75">
                <animateMotion
                  path="M 335 200 Q 470 260 500 445"
                  dur="5s"
                  begin="1s"
                  repeatCount="indefinite"
                />
              </circle>
            </>
          )}
        </svg>

        {/* LABELED HUB MARKERS & FLOATING LOCATION TAGS */}
        <div className="absolute inset-0 pointer-events-auto">
          {locationTags.map((tag) => {
            const isHovered = hoveredTag === tag.id;

            return (
              <div
                key={tag.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-300 group"
                style={{
                  left: `${(tag.x / 680) * 100}%`,
                  top: `${(tag.y / 680) * 100}%`,
                  opacity: loaded ? (isHovered ? 1 : 0.9) : 0,
                  transform: `translate(-50%, -50%) scale(${isHovered ? 1.08 : 1})`,
                }}
                onMouseEnter={() => setHoveredTag(tag.id)}
                onMouseLeave={() => setHoveredTag(null)}
              >
                {/* Standardized Labeled Hub Dot Marker */}
                <div className="relative flex items-center justify-center">
                  <div
                    className={`w-2.5 h-2.5 rounded-full shadow-[0_0_8px_#D4AF37] transition-transform duration-300 ${
                      isHovered ? "scale-125" : ""
                    }`}
                    style={{ backgroundColor: tag.color }}
                  />
                  <div className="absolute w-5 h-5 rounded-full border border-[#D4AF37]/40 animate-ping opacity-40 pointer-events-none" />
                </div>

                {/* Location Label Pill */}
                <div
                  className={`absolute left-1/2 -translate-x-1/2 top-4 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#0B1F3A]/95 border shadow-md backdrop-blur-md transition-all duration-300 whitespace-nowrap ${
                    isHovered
                      ? "border-[#D4AF37] bg-[#0B1F3A] shadow-[0_0_14px_rgba(212,175,55,0.4)] scale-105"
                      : "border-[#D4AF37]/35 hover:border-[#D4AF37]/70"
                  }`}
                >
                  <span className="text-[10px] font-bold tracking-wider text-white uppercase">
                    {tag.name}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
