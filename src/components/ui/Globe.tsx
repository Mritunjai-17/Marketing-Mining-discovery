"use client";

import React, { useEffect, useRef, useState } from "react";
import createGlobe from "cobe";

export interface GlobeProps {
  className?: string;
  size?: number;
}

export interface MiningHub {
  name: string;
  commodity: string;
  location: [number, number];
  size: number;
  color: [number, number, number];
  hexColor: string;
}

// Mining Hubs
export const miningHubs: MiningHub[] = [
  {
    name: "Perth, Australia",
    commodity: "Gold & Iron Ore",
    location: [-31.95, 115.86],
    size: 0.15,
    color: [0.85, 0.65, 0.12], // Gold
    hexColor: "#D4AF37",
  },
  {
    name: "Santiago, Chile",
    commodity: "Copper & Lithium",
    location: [-33.45, -70.66],
    size: 0.15,
    color: [0.92, 0.92, 0.92], // Light Gray / White
    hexColor: "#E5E5E3",
  },
  {
    name: "Toronto, Canada",
    commodity: "Mining Capital & Gold",
    location: [43.65, -79.38],
    size: 0.15,
    color: [0.85, 0.65, 0.12], // Gold
    hexColor: "#D4AF37",
  },
  {
    name: "Johannesburg, SA",
    commodity: "Platinum & Diamonds",
    location: [-26.20, 28.04],
    size: 0.15,
    color: [0.92, 0.92, 0.92], // Light Gray / White
    hexColor: "#E5E5E3",
  },
  {
    name: "Nevada, USA",
    commodity: "Gold & Lithium",
    location: [40.5, -116.5],
    size: 0.15,
    color: [0.85, 0.65, 0.12], // Gold
    hexColor: "#D4AF37",
  },
  {
    name: "Lima, Peru",
    commodity: "Silver & Zinc",
    location: [-12.04, -77.04],
    size: 0.15,
    color: [0.92, 0.92, 0.92], // Light Gray / White
    hexColor: "#E5E5E3",
  },
];

// Trade Arcs
const tradeArcs = [
  { from: [43.65, -79.38], to: [-33.45, -70.66], color: [0.85, 0.65, 0.12] }, // Toronto -> Santiago
  { from: [-31.95, 115.86], to: [-26.2, 28.04], color: [0.92, 0.92, 0.92] },   // Perth -> Johannesburg
];

export const Globe: React.FC<GlobeProps> = ({ className = "", size = 580 }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const pointerInteracting = useRef<{ x: number; y: number } | null>(null);
  const pointerInteractionMovement = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const phiRef = useRef(0);
  const thetaRef = useRef(0.25);
  const autoRotateTimer = useRef<NodeJS.Timeout | null>(null);
  const [isInView, setIsInView] = useState(true);

  // Intersection Observer to pause rendering when scrolled out
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    if (canvasRef.current) {
      observer.observe(canvasRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let width = 0;
    const currentCanvas = canvasRef.current;
    if (!currentCanvas || !isInView) return;

    const onResize = () => {
      if (currentCanvas) {
        width = currentCanvas.offsetWidth;
      }
    };
    onResize();
    window.addEventListener("resize", onResize);

    const globe = createGlobe(currentCanvas, {
      devicePixelRatio: 2,
      width: width * 2 || size * 2,
      height: width * 2 || size * 2,
      phi: phiRef.current,
      theta: thetaRef.current,
      dark: 0,
      diffuse: 1.35,
      mapSamples: 22000,
      mapBrightness: 6.5,
      mapBaseBrightness: 0.12,
      baseColor: [0.86, 0.78, 0.65], // Warm rich copper-gold tan dots
      markerColor: [0.85, 0.65, 0.12], // Gold
      glowColor: [0.92, 0.75, 0.35], // Soft outer gold ambient glow
      markers: miningHubs.map((h) => ({
        location: h.location as [number, number],
        size: h.size,
        color: h.color,
      })),
      arcs: tradeArcs.map((a) => ({
        from: a.from as [number, number],
        to: a.to as [number, number],
        color: a.color as [number, number, number],
      })),
      arcColor: [0.85, 0.65, 0.12],
      arcWidth: 1.4,
      arcHeight: 0.32,
    });

    let animFrameId: number;

    const renderFrame = () => {
      if (pointerInteracting.current === null) {
        phiRef.current += 0.003; // Slow continuous rotation
      }

      const currentPhi = phiRef.current + pointerInteractionMovement.current.x;
      const rawTheta = thetaRef.current - pointerInteractionMovement.current.y;
      const currentTheta = Math.max(-1.35, Math.min(1.35, rawTheta));

      globe.update({ phi: currentPhi, theta: currentTheta });
      animFrameId = requestAnimationFrame(renderFrame);
    };

    animFrameId = requestAnimationFrame(renderFrame);

    return () => {
      cancelAnimationFrame(animFrameId);
      globe.destroy();
      window.removeEventListener("resize", onResize);
    };
  }, [isInView, size]);

  const handlePointerUpOrOut = () => {
    if (pointerInteracting.current !== null) {
      phiRef.current += pointerInteractionMovement.current.x;
      const newTheta = thetaRef.current - pointerInteractionMovement.current.y;
      thetaRef.current = Math.max(-1.35, Math.min(1.35, newTheta));

      pointerInteractionMovement.current = { x: 0, y: 0 };
      pointerInteracting.current = null;
    }
  };

  return (
    <div className={`relative flex flex-col items-center select-none ${className}`}>
      {/* Soft Outer Ambient Gold Glow */}
      <div className="absolute inset-0 rounded-full pointer-events-none transition-all duration-300 blur-3xl opacity-30 bg-radial from-[#D4AF37]/40 via-[#B8860B]/20 to-transparent -z-10" />

      {/* Globe WebGL Canvas Container */}
      <div
        className="relative flex items-center justify-center cursor-grab active:cursor-grabbing touch-none"
        onPointerDown={(e) => {
          pointerInteracting.current = {
            x: e.clientX,
            y: e.clientY,
          };
          pointerInteractionMovement.current = { x: 0, y: 0 };
          if (autoRotateTimer.current) clearTimeout(autoRotateTimer.current);
        }}
        onPointerUp={handlePointerUpOrOut}
        onPointerLeave={handlePointerUpOrOut}
        onMouseMove={(e) => {
          if (pointerInteracting.current !== null) {
            const deltaX = e.clientX - pointerInteracting.current.x;
            const deltaY = e.clientY - pointerInteracting.current.y;
            pointerInteractionMovement.current = {
              x: deltaX * 0.006,
              y: deltaY * 0.006,
            };
          }
        }}
        onTouchMove={(e) => {
          if (pointerInteracting.current !== null && e.touches[0]) {
            const deltaX = e.touches[0].clientX - pointerInteracting.current.x;
            const deltaY = e.touches[0].clientY - pointerInteracting.current.y;
            pointerInteractionMovement.current = {
              x: deltaX * 0.006,
              y: deltaY * 0.006,
            };
          }
        }}
      >
        <canvas
          ref={canvasRef}
          className="w-full h-full max-w-[600px] max-h-[600px] aspect-square transition-opacity duration-700 filter drop-shadow-xl"
          style={{
            width: `${size}px`,
            height: `${size}px`,
            contain: "layout paint size",
          }}
        />
      </div>
    </div>
  );
};
