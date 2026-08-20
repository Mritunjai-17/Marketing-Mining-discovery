/**
 * PROCEDURAL EARTH TEXTURE BUILDER
 *
 * Renders an equirectangular (2:1) day map and a companion data mask straight from
 * the `world-atlas` TopoJSON already vendored in this project, so the globe ships with
 * real coastlines and no external image assets or CDN requests.
 *
 * Outputs
 *  - day  : sRGB colour map (deep ocean, latitude-banded terrain, coastlines, borders, ice caps)
 *  - mask : linear data map where the red channel is 0 over ocean and roughly 0.35..1.0 over
 *           land. The shader reads it for (a) land/ocean specular separation, (b) surface
 *           relief via a gradient, and (c) sparse night-side city lights above a threshold.
 */

import { geoEquirectangular, geoPath } from "d3-geo";
import * as topojson from "topojson-client";
import type { GeoPermissibleObjects } from "d3-geo";

export interface EarthTextureResult {
  day: HTMLCanvasElement;
  mask: HTMLCanvasElement;
}

interface NoiseOptions {
  seed: number;
  octaves: number;
  lo: number;
  hi: number;
  falloff: number;
}

/** Deterministic PRNG so the terrain grain is identical on every load. */
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function makeCanvas(w: number, h: number) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return c;
}

/**
 * Approximates fBm by stacking bilinearly upscaled lattices of random values.
 * The browser interpolates natively, which is far cheaper than looping multi-octave
 * value noise over several million pixels in JS.
 *
 * Returns its own canvas rather than painting into the target: the finest octave is only
 * a few hundred rows, so the result is smooth enough to compose onto the (much larger)
 * map in a single scaled drawImage instead of one blend per octave at full resolution.
 */
function createFractalNoise(w: number, h: number, opts: NoiseOptions): HTMLCanvasElement {
  const out = makeCanvas(w, h);
  const ctx = out.getContext("2d");
  const rand = mulberry32(opts.seed);
  const lattice = document.createElement("canvas");
  const lctx = lattice.getContext("2d");
  if (!ctx || !lctx) return out;

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  for (let o = 0; o < opts.octaves; o += 1) {
    const rows = 4 * 2 ** o;
    lattice.width = rows * 2;
    lattice.height = rows;

    const img = lctx.createImageData(lattice.width, lattice.height);
    const span = opts.hi - opts.lo;
    for (let i = 0; i < img.data.length; i += 4) {
      // Octave 0 is the opaque base layer, so it stays inside [lo, hi] to guarantee land
      // never darkens into the ocean value range. Detail octaves use the full range
      // because they are blended at low alpha on top.
      const v = o === 0 ? opts.lo + rand() * span : rand() * 255;
      img.data[i] = v;
      img.data[i + 1] = v;
      img.data[i + 2] = v;
      img.data[i + 3] = 255;
    }
    lctx.putImageData(img, 0, 0);

    ctx.globalAlpha = o === 0 ? 1 : opts.falloff / 2 ** (o - 1);
    ctx.drawImage(lattice, 0, 0, w, h);
  }

  return out;
}

/** Resolution the noise is generated at before being scaled onto a map. */
function noiseSize(mapWidth: number) {
  const w = Math.min(2048, mapWidth);
  return { w, h: w / 2 };
}

/** Latitude-banded terrain palette: ice, tundra, boreal, arid, tropic, ice. */
function terrainGradient(ctx: CanvasRenderingContext2D, h: number) {
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0.0, "#DFE6E8");
  g.addColorStop(0.06, "#93A29B");
  g.addColorStop(0.14, "#5C6B58");
  g.addColorStop(0.26, "#4E5C48");
  g.addColorStop(0.36, "#6B6E4B");
  g.addColorStop(0.44, "#7A7550");
  g.addColorStop(0.52, "#4F6144");
  g.addColorStop(0.6, "#5C6446");
  g.addColorStop(0.68, "#75714E");
  g.addColorStop(0.78, "#5A6449");
  g.addColorStop(0.88, "#8B968F");
  g.addColorStop(1.0, "#DFE6E8");
  return g;
}

/** Deep, desaturated navy ocean that stays lighter toward the poles. */
function oceanGradient(ctx: CanvasRenderingContext2D, h: number) {
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0.0, "#1B3A56");
  g.addColorStop(0.16, "#122C48");
  g.addColorStop(0.5, "#081A31");
  g.addColorStop(0.84, "#122C48");
  g.addColorStop(1.0, "#1B3A56");
  return g;
}

/** Soft white polar caps blended over both land and sea ice. */
function paintIceCaps(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const north = ctx.createLinearGradient(0, 0, 0, h * 0.1);
  north.addColorStop(0, "rgba(240,245,248,0.92)");
  north.addColorStop(0.45, "rgba(240,245,248,0.42)");
  north.addColorStop(1, "rgba(240,245,248,0)");
  ctx.fillStyle = north;
  ctx.fillRect(0, 0, w, h * 0.1);

  const south = ctx.createLinearGradient(0, h, 0, h * 0.87);
  south.addColorStop(0, "rgba(244,248,250,0.96)");
  south.addColorStop(0.5, "rgba(244,248,250,0.5)");
  south.addColorStop(1, "rgba(244,248,250,0)");
  ctx.fillStyle = south;
  ctx.fillRect(0, h * 0.87, w, h * 0.13);
}

function equirectPath(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const projection = geoEquirectangular()
    .translate([w / 2, h / 2])
    .scale(w / (2 * Math.PI));
  return geoPath(projection, ctx);
}

function paintDayMap(
  land: GeoPermissibleObjects,
  borders: GeoPermissibleObjects,
  w: number
): HTMLCanvasElement {
  const h = w / 2;
  const canvas = makeCanvas(w, h);
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;

  const path = equirectPath(ctx, w, h);
  const unit = w / 2048;
  const noise = noiseSize(w);

  // Ocean
  ctx.fillStyle = oceanGradient(ctx, h);
  ctx.fillRect(0, 0, w, h);

  ctx.save();
  ctx.globalCompositeOperation = "overlay";
  ctx.globalAlpha = 0.12;
  ctx.drawImage(
    createFractalNoise(noise.w, noise.h, { seed: 90210, octaves: 4, lo: 96, hi: 190, falloff: 0.3 }),
    0,
    0,
    w,
    h
  );
  ctx.restore();

  // Land
  ctx.save();
  ctx.beginPath();
  path(land);
  ctx.clip();

  ctx.fillStyle = terrainGradient(ctx, h);
  ctx.fillRect(0, 0, w, h);

  ctx.globalCompositeOperation = "overlay";
  ctx.globalAlpha = 0.38;
  ctx.drawImage(
    createFractalNoise(noise.w, noise.h, { seed: 1337, octaves: 6, lo: 88, hi: 208, falloff: 0.34 }),
    0,
    0,
    w,
    h
  );
  ctx.restore();

  // Coastlines and administrative borders
  ctx.save();
  ctx.lineJoin = "round";
  ctx.beginPath();
  path(land);
  ctx.lineWidth = 1.1 * unit;
  ctx.strokeStyle = "rgba(196,214,214,0.34)";
  ctx.stroke();

  ctx.beginPath();
  path(borders);
  ctx.lineWidth = 0.8 * unit;
  ctx.strokeStyle = "rgba(255,255,255,0.08)";
  ctx.stroke();
  ctx.restore();

  paintIceCaps(ctx, w, h);

  return canvas;
}

function paintMaskMap(land: GeoPermissibleObjects, w: number): HTMLCanvasElement {
  const h = w / 2;
  const canvas = makeCanvas(w, h);
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;

  const path = equirectPath(ctx, w, h);

  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, w, h);

  ctx.save();
  ctx.beginPath();
  path(land);
  ctx.clip();
  // The base sits well above the shader land cutoff; the fine octaves supply both the
  // relief gradient and the sparse peaks that become night-side city lights.
  ctx.drawImage(
    createFractalNoise(w, h, { seed: 24601, octaves: 7, lo: 132, hi: 236, falloff: 0.36 }),
    0,
    0,
    w,
    h
  );
  ctx.restore();

  return canvas;
}

/**
 * Builds both maps. The TopoJSON is pulled in via dynamic import so the ~750KB atlas
 * lands in its own chunk, fetched after the hero has already painted.
 */
export async function buildEarthTextures(dayWidth: number): Promise<EarthTextureResult> {
  const atlas = await import("world-atlas/countries-50m.json");
  /* eslint-disable @typescript-eslint/no-explicit-any */
  const topology = ((atlas as any).default ?? atlas) as any;

  const land = topojson.merge(
    topology,
    topology.objects.countries.geometries
  ) as unknown as GeoPermissibleObjects;

  const borders = topojson.mesh(
    topology,
    topology.objects.countries,
    (a: any, b: any) => a !== b
  ) as unknown as GeoPermissibleObjects;
  /* eslint-enable @typescript-eslint/no-explicit-any */

  return {
    day: paintDayMap(land, borders, dayWidth),
    mask: paintMaskMap(land, Math.max(1024, Math.round(dayWidth / 2))),
  };
}
