"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { GlobeAnchor, ProjectedAnchor } from "@/components/ui/globe/EarthGlobe";

// WebGL has no server render, and the topojson chunk should not block first paint.
const EarthGlobe = dynamic(
  () => import("@/components/ui/globe/EarthGlobe").then((m) => m.EarthGlobe),
  { ssr: false }
);

interface TeamMarker extends GlobeAnchor {
  initials: string;
  name: string;
  city: string;
  /** Narrow viewports keep only a subset, so the dome stays uncluttered. */
  showOnMobile?: boolean;
}

/**
 * Placeholder team roster — swap the names and initials for real people (or photos).
 *
 * Longitudes are spread as evenly as real cities allow, so one to three markers sit on
 * the visible cap at any point in the rotation. Latitudes are all northern mid-latitudes:
 * the container crops the sphere to a shallow cap, and at the globe's VIEW_PITCH anything
 * much nearer the equator stays below the container edge for the whole revolution.
 */
const TEAM_MARKERS: TeamMarker[] = [
  { id: "honolulu", initials: "KM", name: "Kai Moana", city: "Honolulu", lat: 21.307, lng: -157.858 },
  { id: "toronto", initials: "AR", name: "Amara Reyes", city: "Toronto", lat: 43.653, lng: -79.383, showOnMobile: true },
  { id: "london", initials: "JC", name: "Jonah Clarke", city: "London", lat: 51.507, lng: -0.128, showOnMobile: true },
  { id: "cairo", initials: "WM", name: "Wanjiru Mensah", city: "Cairo", lat: 30.044, lng: 31.236 },
  { id: "mumbai", initials: "DK", name: "Devan Kapoor", city: "Mumbai", lat: 19.076, lng: 72.878, showOnMobile: true },
  { id: "hongkong", initials: "LT", name: "Lien Tan", city: "Hong Kong", lat: 22.319, lng: 114.169 },
];

const ANCHORS: GlobeAnchor[] = TEAM_MARKERS.map(({ id, lat, lng }) => ({ id, lat, lng }));

export const GlobeHero: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const globeBoxRef = useRef<HTMLDivElement>(null);
  const markerRefs = useRef(new Map<string, HTMLDivElement | null>());

  /**
   * Bounds of the container as seen from the globe canvas coordinate space, so a
   * marker can fade out before the container clips its avatar mid-shape. Cached on
   * resize rather than measured per frame to avoid forced layout in the render loop.
   */
  const clipRef = useRef({
    maxY: Infinity,
    minX: -Infinity,
    maxX: Infinity,
    fadeX: 110,
    fadeY: 130,
  });

  const [ready, setReady] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    const box = globeBoxRef.current;
    if (!container || !box) return;

    const measure = () => {
      const c = container.getBoundingClientRect();
      const b = box.getBoundingClientRect();
      clipRef.current = {
        maxY: c.bottom - b.top,
        minX: c.left - b.left,
        maxX: c.right - b.left,
        // Scaled to the card: a fixed band would keep a marker faded for most of its
        // pass across a narrow phone container.
        fadeX: Math.min(110, c.width * 0.18),
        fadeY: Math.min(130, c.height * 0.16),
      };
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  const handleProject = useCallback((projected: ProjectedAnchor[]) => {
    const { maxY, minX, maxX, fadeX, fadeY } = clipRef.current;

    for (const anchor of projected) {
      const el = markerRefs.current.get(anchor.id);
      if (!el) continue;

      // Fade before the container edge clips the avatar, not after.
      const bottomFade = Math.min(Math.max((maxY - anchor.y) / fadeY, 0), 1);
      const leftFade = Math.min(Math.max((anchor.x - minX) / fadeX, 0), 1);
      const rightFade = Math.min(Math.max((maxX - anchor.x) / fadeX, 0), 1);
      const opacity = anchor.opacity * bottomFade * leftFade * rightFade;

      const style = el.style;
      if (opacity <= 0.01) {
        if (style.visibility !== "hidden") style.visibility = "hidden";
        continue;
      }
      if (style.visibility === "hidden") style.visibility = "";

      style.setProperty("--mx", `${anchor.x.toFixed(1)}px`);
      style.setProperty("--my", `${anchor.y.toFixed(1)}px`);
      style.setProperty("--dx", anchor.dirX.toFixed(4));
      style.setProperty("--dy", anchor.dirY.toFixed(4));
      style.setProperty("--angle", `${Math.atan2(anchor.dirY, anchor.dirX).toFixed(4)}rad`);
      style.opacity = opacity.toFixed(3);
    }
  }, []);

  const handleReady = useCallback(() => setReady(true), []);

  return (
    <section className="relative w-full bg-[#F2F2F0] px-[4vw] pt-[84px] pb-14 sm:pb-20 lg:pt-[104px]">
      <div
        ref={containerRef}
        className="
          hero-rise
          relative mx-auto w-full max-w-[1400px] overflow-hidden
          rounded-[28px] lg:rounded-[32px]
          border border-[#E5E5E3] bg-white
          shadow-[0_1px_2px_rgba(16,24,40,0.04),0_28px_64px_-28px_rgba(16,24,40,0.16)]
          h-[700px] sm:h-[760px] lg:h-[820px] xl:h-[880px]
        "
      >
        {/* Layer 2 + 3 — globe and its atmosphere, cropped by the container bottom and sides */}
        <div
          ref={globeBoxRef}
          className={`
            absolute left-1/2 z-10 aspect-square -translate-x-1/2
            w-[165vw] top-[46%]
            sm:w-[145vw] sm:top-[43%]
            lg:w-[140%] lg:top-[39%]
            transition-[opacity,transform] duration-[1400ms] ease-[cubic-bezier(0.16,1,0.3,1)]
            motion-reduce:transition-none
            ${ready ? "opacity-100 scale-100" : "opacity-0 scale-[0.92] motion-reduce:scale-100"}
          `}
        >
          <EarthGlobe
            className="h-full w-full"
            anchors={ANCHORS}
            onProject={handleProject}
            onReady={handleReady}
          />

          {/* Layer 4 — markers, in the same coordinate box as the globe canvas */}
          <div
            className={`
              pointer-events-none absolute inset-0 z-10
              transition-opacity duration-700 delay-500
              ${ready ? "opacity-100" : "opacity-0"}
            `}
          >
            {TEAM_MARKERS.map((marker) => (
              <div
                key={marker.id}
                ref={(el) => {
                  markerRefs.current.set(marker.id, el);
                }}
                style={{ transform: "translate3d(var(--mx, -9999px), var(--my, -9999px), 0)" }}
                className={`
                  absolute left-0 top-0 [--len:56px] lg:[--len:80px]
                  ${marker.showOnMobile ? "" : "hidden sm:block"}
                `}
              >
                {/* Anchor dot pinned to the landmass */}
                <span className="absolute left-0 top-0 block h-[7px] w-[7px] -translate-x-1/2 -translate-y-1/2 rounded-full border-[1.5px] border-[#0B1F3A]/55 bg-white shadow-[0_1px_3px_rgba(11,31,58,0.35)]" />

                {/* Connector — mid grey so it reads on both the white card and the dark planet */}
                <span
                  className="absolute left-0 top-0 block h-px origin-left bg-[linear-gradient(90deg,rgba(138,150,164,0.85),rgba(138,150,164,0.35))]"
                  style={{ width: "var(--len)", transform: "rotate(var(--angle, 0rad))" }}
                />

                {/* Avatar, offset along the outward normal */}
                <div
                  className="absolute left-0 top-0"
                  style={{
                    transform:
                      "translate3d(calc(var(--dx, 0) * var(--len)), calc(var(--dy, 0) * var(--len)), 0)",
                  }}
                >
                  {/* Avatar sits on the end of the connector; the label stacks further
                      out along the same normal so it never crosses the line. */}
                  <div className="absolute left-0 top-0 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-[#E5E5E3] bg-white font-geist text-[11px] font-semibold tracking-[0.02em] text-[#0B1F3A] shadow-[0_2px_10px_rgba(16,24,40,0.16)] lg:h-11 lg:w-11 lg:text-xs">
                    {marker.initials}
                  </div>
                  <div className="absolute left-0 top-0 hidden -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-full border border-[#E5E5E3] bg-white/95 px-3 py-1 text-center shadow-[0_2px_8px_rgba(16,24,40,0.10)] backdrop-blur-[2px] -mt-[30px] lg:block">
                    <span className="block font-geist text-[11px] font-medium leading-tight text-[#1A1D21]">
                      {marker.name}
                    </span>
                    <span className="block font-geist text-[9px] font-medium uppercase leading-tight tracking-[0.14em] text-[#8A8C90]">
                      {marker.city}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Layer 5 — typography */}
        <div className="relative z-30 flex flex-col items-center px-6 pt-[64px] text-center sm:px-10 lg:pt-[92px]">
          <h1 className="hero-rise [animation-delay:120ms] max-w-[16ch] font-geist font-semibold leading-[1.04] tracking-[-0.035em] text-[#15181C] text-[clamp(2.5rem,5.2vw,4.5rem)]">
            All over the world
          </h1>

          <p className="hero-rise [animation-delay:220ms] mt-6 max-w-[30ch] font-geist font-normal leading-[1.45] tracking-[-0.01em] text-[#57595E] text-[clamp(1.125rem,1.7vw,1.625rem)] sm:mt-7 sm:max-w-[34ch] lg:mt-8">
            Meet our distributed team of experts working across 6 continents.
          </p>
        </div>
      </div>
    </section>
  );
};

export default GlobeHero;
