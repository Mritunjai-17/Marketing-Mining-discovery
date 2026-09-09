'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from '@/hooks/useReducedMotion';

export interface HeroSignalProps {
  className?: string;
  onSignalTrigger?: (signalId: string) => void;
}

type NodeCategory =
  | 'company'
  | 'story'
  | 'media'
  | 'investor'
  | 'audience'
  | 'growth'
  | 'project'
  | 'capital'
  | 'intelligence'
  | 'brand';

// 'primary' nodes are the original globe network (count, seeding, connections and
// styling untouched) — they carry the structural links, the labels and the gold.
// 'ambient' nodes are background network points: a second, independently seeded
// Fibonacci shell that fills the gaps between primaries so the globe reads dense.
// They are drawn small and dim, and never take part in the connection mesh.
// 'detail' nodes are network dust that stays fully transparent while the globe
// rests, materialising only to give the wordmark its dot resolution.
type NodeTier = 'primary' | 'ambient' | 'detail';

interface InteractiveGlobeNode {
  id: string;
  label: string;
  category: NodeCategory;
  tier: NodeTier;
  // 3D Fibonacci Sphere Base Unit Vector (x^2 + y^2 + z^2 = 1)
  sx: number;
  sy: number;
  sz: number;
  // Current 3D Rotated Coordinates
  rx: number;
  ry: number;
  rz: number;
  // Dynamic Resting Target Coordinates (pixels)
  restPx: number;
  restPy: number;
  // Animated Current Screen Coordinates (pixels)
  px: number;
  py: number;
  // Physics Velocity
  vx: number;
  vy: number;
  // Position of this node inside its own tier (drives the scroll-phase waves)
  waveIndex: number;
  // Deterministic wordmark target, stored as a signed offset from the wordmark
  // centre in units of the FULL wordmark width. Aspect-correct at any scale, and
  // centred on the bounding box of the complete phrase.
  wmX: number;
  wmY: number;
  // Per-node formation delay so letters assemble left to right
  formStagger: number;
  // Per-node eased formation progress for the current frame (0 globe, 1 wordmark)
  formEase: number;
  // Precomputed Target Normalized Vectors (0 to 1)
  storyX: number;
  storyY: number;
  bridgeX: number;
  bridgeY: number;
  // Stylistic Attributes
  isGoldAccent: boolean;
  baseSize: number;
}

const CONCEPTUAL_CATEGORIES: { category: NodeCategory; label: string }[] = [
  { category: 'company', label: 'COMPANY' },
  { category: 'story', label: 'STORY' },
  { category: 'media', label: 'MEDIA' },
  { category: 'investor', label: 'INVESTOR' },
  { category: 'audience', label: 'AUDIENCE' },
  { category: 'growth', label: 'GROWTH' },
  { category: 'project', label: 'PROJECT' },
  { category: 'capital', label: 'CAPITAL' },
  { category: 'intelligence', label: 'INTELLIGENCE' },
  { category: 'brand', label: 'BRAND' },
];

/* ------------------------------------------------------------------ *
 * WORDMARK GEOMETRY
 *
 * The complete phrase is rendered once into an offscreen canvas with a
 * bold geometric sans, then rasterised onto a regular square lattice.
 * Every lattice cell whose ink coverage clears a threshold becomes one
 * deterministic node target. Nothing here is ever drawn to the screen —
 * it only produces coordinates.
 * ------------------------------------------------------------------ */

const WORDMARK_LINE_ONE = 'MINING';
const WORDMARK_LINE_TWO = 'DISCOVERY';

interface WordmarkGeometry {
  /** Target points, x/y normalised so the full phrase width == 1, centred on (0,0). */
  points: { x: number; y: number }[];
  /** phraseHeight / phraseWidth */
  aspect: number;
  /** Lattice pitch as a fraction of the phrase width — drives the dot radius. */
  gridSpacing: number;
  /** Diagnostic: vertical dot count across one capital letter. */
  dotsPerCapHeight: number;
  widthPx: number;
  heightPx: number;
}

function buildWordmarkGeometry(budget: number): WordmarkGeometry | null {
  if (typeof document === 'undefined') return null;

  const OFF_W = 2048;
  const OFF_H = 700;
  const FONT_PX = 170;
  // Even optical rhythm between characters, and a clear editorial gap between the two words.
  const TRACK = FONT_PX * 0.035;
  const LINE_GAP = FONT_PX * 0.42;

  const off = document.createElement('canvas');
  off.width = OFF_W;
  off.height = OFF_H;
  const c = off.getContext('2d', { willReadFrequently: true });
  if (!c) return null;

  // Prefer the site's geometric grotesque; fall back to guaranteed heavy system faces.
  let siteSans = '';
  try {
    siteSans = getComputedStyle(document.documentElement)
      .getPropertyValue('--font-geist-sans')
      .trim();
  } catch {
    siteSans = '';
  }
  const stack = `${siteSans ? `${siteSans}, ` : ''}"Arial Black", "Helvetica Neue", Helvetica, Arial, sans-serif`;

  c.fillStyle = '#000000';
  c.fillRect(0, 0, OFF_W, OFF_H);
  c.font = `800 ${FONT_PX}px ${stack}`;
  c.textAlign = 'left';
  c.textBaseline = 'alphabetic';
  c.fillStyle = '#FFFFFF';

  const capMetrics = c.measureText('H');
  const capHeight = capMetrics.actualBoundingBoxAscent || FONT_PX * 0.72;

  const measureLine = (word: string) => {
    const chars = word.split('');
    const widths = chars.map((ch) => c.measureText(ch).width);
    const total = widths.reduce((a, b) => a + b, 0) + TRACK * (chars.length - 1);
    return { chars, widths, total };
  };

  const lineOne = measureLine(WORDMARK_LINE_ONE);
  const lineTwo = measureLine(WORDMARK_LINE_TWO);

  // Vertically centre the two-line block on the offscreen surface.
  const baselineOne = OFF_H / 2 - LINE_GAP / 2;
  const baselineTwo = baselineOne + capHeight + LINE_GAP;

  const drawLine = (line: ReturnType<typeof measureLine>, baselineY: number) => {
    let x = (OFF_W - line.total) / 2;
    line.chars.forEach((ch, i) => {
      c.fillText(ch, x, baselineY);
      x += line.widths[i] + TRACK;
    });
  };

  drawLine(lineOne, baselineOne);
  drawLine(lineTwo, baselineTwo);

  // Build an ink mask + the bounding box of the COMPLETE phrase.
  const img = c.getImageData(0, 0, OFF_W, OFF_H).data;
  const mask = new Uint8Array(OFF_W * OFF_H);
  let minX = OFF_W;
  let maxX = -1;
  let minY = OFF_H;
  let maxY = -1;
  let inkArea = 0;

  for (let y = 0; y < OFF_H; y++) {
    const row = y * OFF_W;
    for (let x = 0; x < OFF_W; x++) {
      if (img[(row + x) * 4] > 140) {
        mask[row + x] = 1;
        inkArea++;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  if (maxX < 0 || inkArea === 0) return null;

  const bboxCx = (minX + maxX) / 2;
  const bboxCy = (minY + maxY) / 2;

  // Ink coverage of one lattice cell, sampled on a 3x3 sub-grid. Guards thin
  // diagonals (M, N, V, Y) against dropping out between lattice lines.
  const coverage = (px: number, py: number, g: number) => {
    const o = g / 3;
    let hit = 0;
    for (let sy = -1; sy <= 1; sy++) {
      for (let sx = -1; sx <= 1; sx++) {
        const qx = Math.round(px + sx * o);
        const qy = Math.round(py + sy * o);
        if (qx >= 0 && qx < OFF_W && qy >= 0 && qy < OFF_H && mask[qy * OFF_W + qx]) hit++;
      }
    }
    return hit / 9;
  };

  // Regular lattice anchored on the phrase centre, so strokes stay symmetric.
  const sampleGrid = (g: number) => {
    const out: { x: number; y: number }[] = [];
    const iMax = Math.ceil((maxX - bboxCx) / g) + 1;
    const jMax = Math.ceil((maxY - bboxCy) / g) + 1;
    for (let j = -jMax; j <= jMax; j++) {
      for (let i = -iMax; i <= iMax; i++) {
        const px = bboxCx + i * g;
        const py = bboxCy + j * g;
        if (coverage(px, py, g) >= 0.34) out.push({ x: px, y: py });
      }
    }
    return out;
  };

  // Solve the lattice pitch that lands the point count on the node budget.
  let g = Math.max(3, Math.sqrt(inkArea / Math.max(1, budget)));
  let points = sampleGrid(g);
  for (let iter = 0; iter < 12; iter++) {
    if (points.length === 0) break;
    const ratio = points.length / budget;
    if (ratio > 0.93 && ratio < 1.07) break;
    const next = Math.max(2.5, g * Math.sqrt(ratio));
    if (Math.abs(next - g) < 0.05) break;
    g = next;
    points = sampleGrid(g);
  }

  if (points.length < 40) return null;

  const tw = Math.max(1, maxX - minX);
  const th = Math.max(1, maxY - minY);

  const normalized = points.map((p) => ({
    x: (p.x - bboxCx) / tw,
    y: (p.y - bboxCy) / tw,
  }));

  // Left-to-right ordering drives both the node assignment stride and the
  // staggered formation sweep.
  normalized.sort((a, b) => (a.x === b.x ? a.y - b.y : a.x - b.x));

  return {
    points: normalized,
    aspect: th / tw,
    gridSpacing: g / tw,
    dotsPerCapHeight: capHeight / g,
    widthPx: tw,
    heightPx: th,
  };
}

// Scroll-phase targets, kept identical to the previous per-tier formulas.
const storyTargetFor = (i: number, count: number) => {
  const t = i / Math.max(1, count - 1);
  return { x: 0.18 + t * 0.64, y: 0.48 + Math.sin(t * Math.PI * 2) * 0.06 };
};

const bridgeTargetFor = (i: number) => {
  const col = i % 10;
  const row = Math.floor(i / 10);
  return {
    x: 0.3 + (col / 10) * 0.4 + Math.sin(i * 0.5) * 0.02,
    y: 0.82 + (row / 11) * 0.28 + Math.cos(i * 0.3) * 0.02,
  };
};

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const smooth = (t: number) => t * t * (3 - 2 * t);

// Wordmark occupies this share of the globe diameter, with breathing room kept
// on every side.
const WORDMARK_WIDTH_RATIO = 0.66;
const WORDMARK_MAX_HEIGHT_RATIO = 0.6;
// Spread of the left-to-right formation sweep. Kept small so the phrase stays
// cohesive mid-transition instead of reading as two unrelated halves.
const FORM_STAGGER = 0.22;

export default function HeroSignal({ className = '' }: HeroSignalProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const prefersReducedMotion = useReducedMotion();

  const [hoveredNode, setHoveredNode] = useState<{
    id: string;
    label: string;
    category: NodeCategory;
    x: number;
    y: number;
  } | null>(null);

  const [formationStateName, setFormationStateName] = useState<string>('GLOBAL GLOBE');

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = containerRef.current.clientWidth;
    // Unchanged structural globe network size.
    const primaryCount = width < 640 ? 54 : width < 1024 ? 80 : 110;
    // Background network points layered between the primaries. These are not new
    // nodes: they are promoted out of the pool the wordmark already allocated, so
    // the total node count, physics cost and wordmark resolution stay the same.
    // Visible globe totals: 112 mobile, 200 tablet/desktop, 220 wide.
    const ambientCount = width < 640 ? 58 : width < 1024 ? 120 : 110;
    // Total dots the formed wordmark aims for (primary + ambient + detail). Tuned
    // so a capital letter is ~6.5-8 dots tall at every breakpoint.
    const wordmarkBudget = width < 640 ? 360 : width < 1024 ? 460 : 560;

    const nodes: InteractiveGlobeNode[] = [];
    const phiRatio = (1 + Math.sqrt(5)) / 2;

    // Fibonacci sphere point with a small deterministic jitter, so a shell reads
    // as structured-organic rather than as a mathematically perfect spiral.
    const seedSpherePoint = (
      index: number,
      count: number,
      seedA: number,
      seedB: number,
      seedC: number,
      jitter: number
    ) => {
      const theta = 2 * Math.PI * index / phiRatio;
      const phi = Math.acos(1 - 2 * (index + 0.5) / count);

      const rawSx = Math.sin(phi) * Math.cos(theta) + Math.sin(index * seedA) * jitter;
      const rawSy = Math.cos(phi) + Math.cos(index * seedB) * jitter;
      const rawSz = Math.sin(phi) * Math.sin(theta) + Math.sin(index * seedC) * jitter;

      const len = Math.sqrt(rawSx * rawSx + rawSy * rawSy + rawSz * rawSz);
      return { sx: rawSx / len, sy: rawSy / len, sz: rawSz / len };
    };

    for (let i = 0; i < primaryCount; i++) {
      const catObj = CONCEPTUAL_CATEGORIES[i % CONCEPTUAL_CATEGORIES.length];
      const { sx, sy, sz } = seedSpherePoint(i, primaryCount, 1.7, 2.3, 3.1, 0.02);

      const sTarget = storyTargetFor(i, primaryCount);
      const bTarget = bridgeTargetFor(i);

      const isGoldAccent = i % 8 === 0;

      nodes.push({
        id: `node-${i}`,
        label: catObj.label,
        category: catObj.category,
        tier: 'primary',
        sx,
        sy,
        sz,
        rx: sx,
        ry: sy,
        rz: sz,
        restPx: 0,
        restPy: 0,
        px: 0,
        py: 0,
        vx: 0,
        vy: 0,
        waveIndex: i / primaryCount,
        wmX: 0,
        wmY: 0,
        formStagger: 0,
        formEase: 0,
        storyX: sTarget.x,
        storyY: sTarget.y,
        bridgeX: bTarget.x,
        bridgeY: bTarget.y,
        isGoldAccent,
        baseSize: isGoldAccent ? 3.6 : 2.3 + (i % 3) * 0.5,
      });
    }

    // Ambient shell. Seeded synchronously with its own Fibonacci distribution and
    // its own jitter phase, so the globe is dense from the first frame and never
    // depends on the wordmark sampler resolving.
    for (let a = 0; a < ambientCount; a++) {
      const catObj = CONCEPTUAL_CATEGORIES[a % CONCEPTUAL_CATEGORIES.length];
      const { sx, sy, sz } = seedSpherePoint(a, ambientCount, 2.11, 1.57, 3.73, 0.035);

      const sTarget = storyTargetFor(a, ambientCount);
      const bTarget = bridgeTargetFor(a);

      // Gold stays restrained: a handful of background accents only.
      const isGoldAccent = a % 18 === 0;

      nodes.push({
        id: `ambient-${a}`,
        label: catObj.label,
        category: catObj.category,
        tier: 'ambient',
        sx,
        sy,
        sz,
        rx: sx,
        ry: sy,
        rz: sz,
        restPx: 0,
        restPy: 0,
        px: 0,
        py: 0,
        vx: 0,
        vy: 0,
        waveIndex: a / ambientCount,
        wmX: 0,
        wmY: 0,
        formStagger: 0,
        formEase: 0,
        storyX: sTarget.x,
        storyY: sTarget.y,
        bridgeX: bTarget.x,
        bridgeY: bTarget.y,
        isGoldAccent,
        baseSize: isGoldAccent ? 2.2 : 1.55 + (a % 3) * 0.25,
      });
    }

    let animationFrameId: number;
    let time = 0;
    let mouseX = -9999;
    let mouseY = -9999;
    let targetMouseTiltX = 0;
    let targetMouseTiltY = 0;
    let currentMouseTiltX = 0;
    let currentMouseTiltY = 0;
    let dpr = window.devicePixelRatio || 1;

    let wordmarkGeo: WordmarkGeometry | null = null;
    let wordmarkReady = false;
    let sortedNodes: InteractiveGlobeNode[] = nodes.slice();
    // With reduced motion there is no animation loop, so the single static frame
    // has to be repainted whenever the backing store is resized (assigning
    // canvas.width clears it) — otherwise the globe blanks out.
    let staticRenderReady = false;

    const resizeCanvas = () => {
      if (!containerRef.current || !canvasRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;

      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      // Prominent Globe Scale: 0.50 ratio fills available visual height on desktop
      const radius = Math.min(canvas.width, canvas.height) * (width < 640 ? 0.40 : width < 1024 ? 0.45 : 0.50);

      nodes.forEach((n) => {
        if (n.px === 0 && n.py === 0) {
          n.restPx = cx + n.rx * radius;
          n.restPy = cy + n.ry * radius;
          n.px = n.restPx;
          n.py = n.restPy;
        }
      });

      if (prefersReducedMotion && staticRenderReady) render();
    };
    resizeCanvas();
    const resizeObserver = new ResizeObserver(resizeCanvas);
    resizeObserver.observe(containerRef.current);

    /* --------------------------------------------------------------
     * Deterministic node -> letter mapping.
     * Every wordmark target point is claimed by exactly one node. The
     * original globe nodes are spread evenly across the whole phrase by
     * an index stride (never bunched into the first word), and the
     * remaining points are filled by detail nodes seeded onto their own
     * Fibonacci sphere so they can travel home to the globe afterwards.
     * -------------------------------------------------------------- */
    const applyWordmarkGeometry = (geo: WordmarkGeometry) => {
      const pts = geo.points;
      const total = pts.length;
      const visibleCount = primaryCount + ambientCount;
      if (total < visibleCount) return;

      // Each tier is strided across the whole phrase so no tier bunches into one
      // word: primaries first, then ambients through what is left, then dust.
      const primarySlots: number[] = [];
      const ambientSlots: number[] = [];
      const detailSlots: number[] = [];
      let remainderIndex = 0;
      const remainderTotal = total - primaryCount;
      for (let t = 0; t < total; t++) {
        const isPrimarySlot =
          Math.floor(((t + 1) * primaryCount) / total) > Math.floor((t * primaryCount) / total);
        if (isPrimarySlot) {
          primarySlots.push(t);
          continue;
        }
        const isAmbientSlot =
          Math.floor(((remainderIndex + 1) * ambientCount) / remainderTotal) >
          Math.floor((remainderIndex * ambientCount) / remainderTotal);
        remainderIndex++;
        (isAmbientSlot ? ambientSlots : detailSlots).push(t);
      }

      for (let p = 0; p < primaryCount; p++) {
        const pt = pts[primarySlots[p]];
        nodes[p].wmX = pt.x;
        nodes[p].wmY = pt.y;
        nodes[p].formStagger = (pt.x + 0.5) * FORM_STAGGER;
      }

      for (let a = 0; a < ambientCount && a < ambientSlots.length; a++) {
        const pt = pts[ambientSlots[a]];
        const node = nodes[primaryCount + a];
        node.wmX = pt.x;
        node.wmY = pt.y;
        node.formStagger = (pt.x + 0.5) * FORM_STAGGER;
      }

      const detailCount = detailSlots.length;
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      const radius =
        Math.min(canvas.width, canvas.height) * (width < 640 ? 0.40 : width < 1024 ? 0.45 : 0.50);

      for (let d = 0; d < detailCount; d++) {
        const { sx, sy, sz } = seedSpherePoint(d, detailCount, 2.9, 1.3, 0.7, 0.02);

        const pt = pts[detailSlots[d]];
        const sTarget = storyTargetFor(d, detailCount);
        const bTarget = bridgeTargetFor(d);

        nodes.push({
          id: `detail-${d}`,
          label: CONCEPTUAL_CATEGORIES[d % CONCEPTUAL_CATEGORIES.length].label,
          category: CONCEPTUAL_CATEGORIES[d % CONCEPTUAL_CATEGORIES.length].category,
          tier: 'detail',
          sx,
          sy,
          sz,
          rx: sx,
          ry: sy,
          rz: sz,
          restPx: cx + sx * radius,
          restPy: cy + sy * radius,
          px: cx + sx * radius,
          py: cy + sy * radius,
          vx: 0,
          vy: 0,
          waveIndex: d / detailCount,
          wmX: pt.x,
          wmY: pt.y,
          formStagger: (pt.x + 0.5) * FORM_STAGGER,
          formEase: 0,
          storyX: sTarget.x,
          storyY: sTarget.y,
          bridgeX: bTarget.x,
          bridgeY: bTarget.y,
          isGoldAccent: false,
          baseSize: 2.0,
        });
      }

      sortedNodes = nodes.slice();
      wordmarkGeo = geo;
      wordmarkReady = true;
    };

    // Sample only once webfonts have settled, so the lattice is cut from the
    // real geometric face rather than a transient fallback.
    let disposed = false;
    const fontsReady: Promise<unknown> =
      typeof document !== 'undefined' && document.fonts?.ready
        ? document.fonts.ready
        : Promise.resolve();

    fontsReady
      .catch(() => undefined)
      .then(() => {
        if (disposed) return;
        const geo = buildWordmarkGeometry(wordmarkBudget);
        if (geo) applyWordmarkGeometry(geo);
      });

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = (e.clientX - rect.left) * dpr;
      mouseY = (e.clientY - rect.top) * dpr;

      const normX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const normY = ((e.clientY - rect.top) / rect.height) * 2 - 1;
      targetMouseTiltY = normX * 0.06;
      targetMouseTiltX = -normY * 0.05;
    };

    const handleMouseLeave = () => {
      mouseX = -9999;
      mouseY = -9999;
      targetMouseTiltX = 0;
      targetMouseTiltY = 0;
      setHoveredNode(null);
    };

    const containerEl = containerRef.current;
    containerEl.addEventListener('mousemove', handleMouseMove, { passive: true });
    containerEl.addEventListener('mouseleave', handleMouseLeave, { passive: true });

    const CYCLE_DURATION = 20;

    const drawBackgroundContour = (
      ctx: CanvasRenderingContext2D,
      w: number,
      h: number,
      time: number,
      scrollProgress: number
    ) => {
      ctx.save();
      const numLines = 5;
      for (let k = 0; k < numLines; k++) {
        ctx.beginPath();
        const yOffset = h * (0.25 + (k / numLines) * 0.5) + scrollProgress * 60 * dpr;
        // Eased back slightly so the denser node field stays the primary read.
        const opacity = Math.max(0, (0.014 + Math.sin(time * 0.4 + k) * 0.006) * (1 - scrollProgress * 0.5));
        ctx.strokeStyle = k % 2 === 0 ? `rgba(197, 160, 89, ${opacity * 1.5})` : `rgba(244, 244, 240, ${opacity})`;
        ctx.lineWidth = 0.8 * dpr;

        for (let x = 0; x <= w; x += 16 * dpr) {
          const nx = x / w;
          const ny = yOffset + Math.sin(nx * Math.PI * 3 + time * 0.2 + k) * 20 * dpr
            + Math.cos(nx * Math.PI * 1.5 - time * 0.15) * 14 * dpr;
          if (x === 0) ctx.moveTo(x, ny);
          else ctx.lineTo(x, ny);
        }
        ctx.stroke();
      }
      ctx.restore();
    };

    const drawGlobeLatitudeRings = (
      ctx: CanvasRenderingContext2D,
      cx: number,
      cy: number,
      radius: number,
      rotX: number,
      scrollProgress: number
    ) => {
      if (scrollProgress > 0.25) return;
      ctx.save();
      const parallels = [-0.6, -0.3, 0, 0.3, 0.6];
      const alphaScale = 1 - (scrollProgress / 0.25);

      parallels.forEach((lat) => {
        const ringRadius = radius * Math.sqrt(1 - lat * lat);
        const ringY = cy + lat * radius * Math.sin(rotX);
        const ringScaleY = Math.abs(Math.cos(rotX)) * 0.35 + 0.05;

        ctx.beginPath();
        ctx.ellipse(cx, ringY, ringRadius, ringRadius * ringScaleY, 0, 0, Math.PI * 2);
        ctx.strokeStyle = lat === 0 ? `rgba(197, 160, 89, ${0.10 * alphaScale})` : `rgba(255, 255, 255, ${0.035 * alphaScale})`;
        ctx.lineWidth = (lat === 0 ? 1.0 : 0.6) * dpr;
        ctx.setLineDash([4 * dpr, 6 * dpr]);
        ctx.stroke();
      });
      ctx.restore();
    };

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    // Render Animation Loop
    const render = () => {
      time += 0.016;
      const w = canvas.width;
      const h = canvas.height;
      const cx = w / 2;
      const cy = h / 2;

      // Prominent Globe Scale (0.50 ratio fills available visual height on desktop)
      const baseGlobeRadius = Math.min(w, h) * (width < 640 ? 0.40 : width < 1024 ? 0.45 : 0.50);

      const scrollY = window.scrollY || 0;
      const heroElem = containerRef.current;
      const heroHeight = heroElem ? heroElem.offsetHeight : window.innerHeight;
      const scrollProgress = Math.min(Math.max(scrollY / (heroHeight * 0.85), 0), 1);

      ctx.clearRect(0, 0, w, h);

      drawBackgroundContour(ctx, w, h, time, scrollProgress);

      currentMouseTiltX += (targetMouseTiltX - currentMouseTiltX) * 0.06;
      currentMouseTiltY += (targetMouseTiltY - currentMouseTiltY) * 0.06;

      const rotY = time * 0.115 + currentMouseTiltY;
      const rotX = 0.30 + currentMouseTiltX;

      // Resting Cycle State: GLOBE (0-9s) -> WORDMARK MINING DISCOVERY (9-15s) -> GLOBE (15-20s)
      const cycleTime = time % CYCLE_DURATION;
      let formationMode: 'GLOBE' | 'WORDMARK' = 'GLOBE';
      let formLerp = 0;
      // The sweep runs in reading order both ways: left-to-right as the phrase
      // assembles, and left-to-right again as it releases.
      let isReleasing = false;

      if (wordmarkReady) {
        if (cycleTime >= 9 && cycleTime < 11.5) {
          formationMode = 'WORDMARK';
          formLerp = (cycleTime - 9) / 2.5;
        } else if (cycleTime >= 11.5 && cycleTime < 15.0) {
          formationMode = 'WORDMARK';
          formLerp = 1;
        } else if (cycleTime >= 15.0 && cycleTime < 17.5) {
          formationMode = 'WORDMARK';
          formLerp = 1 - (cycleTime - 15.0) / 2.5;
          isReleasing = true;
        } else {
          formationMode = 'GLOBE';
          formLerp = 0;
        }
      }

      const easedFormLerp = smooth(formLerp);

      // Wordmark box: centred on the globe centre, sized off the COMPLETE
      // phrase bounding box so neither the M of MINING nor the Y of
      // DISCOVERY can be clipped.
      let wmWidth = 0;
      let wmDotRadius = 1.6 * dpr;
      if (wordmarkGeo) {
        wmWidth = baseGlobeRadius * 2 * WORDMARK_WIDTH_RATIO;
        const maxHeight = baseGlobeRadius * 2 * WORDMARK_MAX_HEIGHT_RATIO;
        if (wordmarkGeo.aspect * wmWidth > maxHeight) {
          wmWidth = maxHeight / wordmarkGeo.aspect;
        }
        // Keep dots visibly separated on the lattice — geometry, not glow.
        wmDotRadius = Math.max(1.0 * dpr, wordmarkGeo.gridSpacing * wmWidth * 0.34);
      }

      let currentModeLabel = 'GLOBAL NETWORK GLOBE';
      if (scrollProgress > 0.75) {
        currentModeLabel = 'SIGNAL // SECTION 02 BRIDGE';
      } else if (scrollProgress > 0.45) {
        currentModeLabel = 'WORDMARK // STORY';
      } else if (scrollProgress > 0.15) {
        currentModeLabel = 'SIGNAL // FLOWING STREAM';
      } else {
        currentModeLabel = formationMode === 'WORDMARK'
          ? (formLerp > 0.8 ? 'WORDMARK // MINING DISCOVERY' : 'FORMING WORDMARK...')
          : 'GLOBAL NETWORK GLOBE';
      }

      if (Math.floor(time * 2) % 4 === 0) {
        setFormationStateName(currentModeLabel);
      }

      const currentGlobeRadius = baseGlobeRadius * (1 + Math.min(scrollProgress, 0.25) * 0.5);

      // Compute 3D Coordinates & Multi-Phase Target Vectors
      nodes.forEach((node) => {
        const x1 = node.sx * Math.cos(rotY) + node.sz * Math.sin(rotY);
        const y1 = node.sy;
        const z1 = -node.sx * Math.sin(rotY) + node.sz * Math.cos(rotY);

        const x2 = x1;
        const y2 = y1 * Math.cos(rotX) - z1 * Math.sin(rotX);
        const z2 = y1 * Math.sin(rotX) + z1 * Math.cos(rotX);

        node.rx = x2;
        node.ry = y2;
        node.rz = z2;

        const perspective = 3.2;
        const scale = perspective / (perspective - z2);

        const globePx = cx + x2 * currentGlobeRadius * scale;
        const globePy = cy + y2 * currentGlobeRadius * scale;

        // Staggered per-node formation so the phrase assembles left to right.
        const stagger = isReleasing ? FORM_STAGGER - node.formStagger : node.formStagger;
        const nodeForm = formLerp <= 0
          ? 0
          : clamp01(formLerp * (1 + FORM_STAGGER) - stagger);
        const nodeEase = smooth(nodeForm);
        node.formEase = nodeEase;

        let baseTargetPx = globePx;
        let baseTargetPy = globePy;

        if (formationMode === 'WORDMARK' && wordmarkGeo) {
          const wordmarkPx = cx + node.wmX * wmWidth;
          const wordmarkPy = cy + node.wmY * wmWidth;
          baseTargetPx = globePx * (1 - nodeEase) + wordmarkPx * nodeEase;
          baseTargetPy = globePy * (1 - nodeEase) + wordmarkPy * nodeEase;
        }

        // Scroll Phase Targets
        const waveIndex = node.waveIndex;
        const signalPx = (0.06 + waveIndex * 0.88) * w;
        const signalPy = cy + Math.sin(waveIndex * Math.PI * 4 + time * 1.5) * (45 * dpr)
          + Math.cos(waveIndex * Math.PI * 2) * (30 * dpr);

        const storyPx = node.storyX * w;
        const storyPy = node.storyY * h;

        const bridgePx = node.bridgeX * w;
        const bridgePy = node.bridgeY * h;

        let finalRestPx = baseTargetPx;
        let finalRestPy = baseTargetPy;

        if (scrollProgress <= 0.20) {
          finalRestPx = baseTargetPx;
          finalRestPy = baseTargetPy;
        } else if (scrollProgress <= 0.50) {
          const t = (scrollProgress - 0.20) / 0.30;
          const easedT = t * t * (3 - 2 * t);
          finalRestPx = lerp(baseTargetPx, signalPx, easedT);
          finalRestPy = lerp(baseTargetPy, signalPy, easedT);
        } else if (scrollProgress <= 0.75) {
          const t = (scrollProgress - 0.50) / 0.25;
          const easedT = t * t * (3 - 2 * t);
          finalRestPx = lerp(signalPx, storyPx, easedT);
          finalRestPy = lerp(storyPy, storyPx, easedT);
        } else {
          const t = (scrollProgress - 0.75) / 0.25;
          const easedT = t * t * (3 - 2 * t);
          finalRestPx = lerp(storyPx, bridgePx, easedT);
          finalRestPy = lerp(storyPy, bridgePx, easedT);
        }

        node.restPx = finalRestPx;
        node.restPy = finalRestPy;
      });

      if (formationMode === 'GLOBE' && scrollProgress < 0.25) {
        drawGlobeLatitudeRings(ctx, cx, cy, currentGlobeRadius, rotX, scrollProgress);
      }

      // Physics Engine
      const cursorActive = scrollProgress < 0.35 && mouseX > 0;
      const interactionRadius = 280 * dpr * (1 - scrollProgress);
      let closestNode: InteractiveGlobeNode | null = null;
      let closestDist = interactionRadius;

      const baseStiffness = scrollProgress > 0 ? 0.12 : 0.048;
      // Stiffen as the letters lock in, so the settled frame is crisp.
      const springStiffness = baseStiffness + (0.16 - baseStiffness) * easedFormLerp;

      nodes.forEach((node) => {
        let ax = 0;
        let ay = 0;

        if (cursorActive) {
          const dx = node.px - mouseX;
          const dy = node.py - mouseY;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < interactionRadius && dist > 0.001) {
            const ux = dx / dist;
            const uy = dy / dist;

            const normDist = dist / interactionRadius;
            const falloff = Math.pow(1 - normDist, 2.4);

            const zNorm = (node.rz + 1) / 2;
            const depthWeight = 0.6 + zNorm * 0.5;

            // Interaction is preserved while the wordmark holds, just eased back
            // enough that the letters stay readable under the cursor.
            const repulsionForce = falloff * (28.0 * dpr) * depthWeight
              * (1 - scrollProgress) * (1 - easedFormLerp * 0.45);

            ax += ux * repulsionForce;
            ay += uy * repulsionForce;

            if (node.tier === 'primary' && dist < closestDist && node.rz > -0.2) {
              closestDist = dist;
              closestNode = node;
            }
          }
        }

        const springDx = node.restPx - node.px;
        const springDy = node.restPy - node.py;

        ax += springDx * springStiffness;
        ay += springDy * springStiffness;

        const damping = 0.85;
        node.vx = (node.vx + ax) * damping;
        node.vy = (node.vy + ay) * damping;

        node.px += node.vx;
        node.py += node.vy;
      });

      if (closestNode && scrollProgress < 0.2) {
        const cNode = closestNode as InteractiveGlobeNode;
        setHoveredNode({
          id: cNode.id,
          label: cNode.label,
          category: cNode.category,
          x: (cNode.px / w) * 100,
          y: (cNode.py / h) * 100,
        });
      } else if (hoveredNode) {
        setHoveredNode(null);
      }

      // Render Connections (primary network only — detail dust never draws lines,
      // so the letterforms stay clean and the globe's link density is unchanged)
      const max3DDist = width < 640 ? 0.65 : 0.55;
      // Links contract to intra-letter reach as the wordmark forms.
      const maxScreenConnectionDist = lerp(
        (scrollProgress > 0.2 ? 160 : 135) * dpr,
        Math.max(26 * dpr, wmDotRadius * 12),
        easedFormLerp
      );

      for (let i = 0; i < primaryCount; i++) {
        for (let j = i + 1; j < primaryCount; j++) {
          const n1 = nodes[i];
          const n2 = nodes[j];

          const dx3 = n1.rx - n2.rx;
          const dy3 = n1.ry - n2.ry;
          const dz3 = n1.rz - n2.rz;
          const dist3D = Math.sqrt(dx3 * dx3 + dy3 * dy3 + dz3 * dz3);

          if (dist3D < max3DDist || scrollProgress > 0.25 || easedFormLerp > 0.35) {
            const dxScreen = n1.px - n2.px;
            const dyScreen = n1.py - n2.py;
            const distScreen = Math.sqrt(dxScreen * dxScreen + dyScreen * dyScreen);

            if (distScreen < maxScreenConnectionDist) {
              const avgZ = (n1.rz + n2.rz) / 2;
              const zAlpha = (avgZ + 1) / 2;

              if (zAlpha < 0.15 && formationMode === 'GLOBE' && scrollProgress < 0.25) continue;

              const screenStretchFactor = 1 - (distScreen / maxScreenConnectionDist);
              const proximity3D = Math.max(0, 1 - dist3D / max3DDist);
              const globeAlpha = proximity3D * (0.06 + zAlpha * 0.33) * screenStretchFactor;
              // While formed, links are a faint uniform scaffold between adjacent
              // letter dots rather than depth-driven globe chords.
              const wordmarkAlpha = screenStretchFactor * 0.085;
              const lineAlpha = lerp(globeAlpha, wordmarkAlpha, easedFormLerp);

              if (lineAlpha <= 0.002) continue;

              const midX = (n1.px + n2.px) / 2;
              const midY = (n1.py + n2.py) / 2;
              const mDist = Math.sqrt(Math.pow(midX - mouseX, 2) + Math.pow(midY - mouseY, 2));
              const isNearMouse = mDist < 160 * dpr && avgZ > 0 && cursorActive;

              ctx.beginPath();
              ctx.moveTo(n1.px, n1.py);
              ctx.lineTo(n2.px, n2.py);

              if (isNearMouse) {
                ctx.strokeStyle = `rgba(197, 160, 89, ${Math.min(lineAlpha * 2.8, 0.75)})`;
                ctx.lineWidth = 1.1 * dpr;
              } else if (n1.isGoldAccent || n2.isGoldAccent) {
                ctx.strokeStyle = `rgba(197, 160, 89, ${lineAlpha * 1.25})`;
                ctx.lineWidth = 0.6 * dpr;
              } else {
                ctx.strokeStyle = `rgba(244, 244, 240, ${lineAlpha})`;
                ctx.lineWidth = 0.45 * dpr;
              }
              ctx.stroke();

              if (
                (isNearMouse || ((i + j) % 23 === 0 && avgZ > 0.3)) &&
                scrollProgress < 0.8 &&
                easedFormLerp < 0.35
              ) {
                const pulseT = (time * 0.7 + (i * 0.08)) % 1;
                const pulseX = n1.px + (n2.px - n1.px) * pulseT;
                const pulseY = n1.py + (n2.py - n1.py) * pulseT;

                ctx.beginPath();
                ctx.arc(pulseX, pulseY, 1.2 * dpr, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(197, 160, 89, 0.85)';
                ctx.fill();
              }
            }
          }
        }
      }

      // Render Nodes (Depth-Sorted; depth shading flattens out as the letters
      // form so every stroke dot carries equal weight)
      if (sortedNodes.length !== nodes.length) sortedNodes = nodes.slice();
      sortedNodes.sort((a, b) => a.rz - b.rz);

      // Detail dust is invisible unless the wordmark is actively formed.
      const scrollFade = 1 - clamp01(scrollProgress / 0.18);

      sortedNodes.forEach((node) => {
        const f = node.formEase;
        const zNorm = (node.rz + 1) / 2;

        let visibility = 1;
        if (node.tier === 'detail') {
          visibility = clamp01((f - 0.15) / 0.45) * scrollFade;
          if (visibility < 0.02) return;
        } else if (node.tier === 'ambient') {
          // Background points sit under the structural network. They lift to full
          // strength only as the letters form, so the wordmark keeps the stronger
          // hierarchy over the surrounding field.
          visibility = lerp(0.74, 1, f);
        }

        // The structural network keeps its original steep depth falloff. Ambient
        // points use a shallower one: a uniform shell projects sparsest through
        // the middle of the disc, and the steep curve would darken the far-side
        // points there to nothing, hollowing out the sphere. They stay below the
        // primaries at every depth, so the front/middle/back hierarchy holds.
        const isAmbient = node.tier === 'ambient';
        const globeScale = isAmbient ? 0.62 + zNorm * 0.5 : 0.5 + zNorm * 0.7;
        const globeAlpha = isAmbient
          ? 0.30 + zNorm * 0.70
          : 0.16 + Math.pow(zNorm, 1.4) * 0.84;

        const depthScale = lerp(globeScale, 1, f);
        const depthAlpha = lerp(globeAlpha, 0.95, f);

        const mDist = Math.sqrt(Math.pow(node.px - mouseX, 2) + Math.pow(node.py - mouseY, 2));
        const isHovered = node.tier === 'primary' && mDist < 140 * dpr && node.rz > 0 && cursorActive;

        const globeSize = (isHovered ? node.baseSize * 1.6 : node.baseSize) * depthScale * dpr;
        const letterSize = wmDotRadius * (node.tier === 'primary' ? 1.14 : 1);
        const size = lerp(globeSize, letterSize, f);

        if (isHovered) {
          ctx.beginPath();
          ctx.arc(node.px, node.py, size * 3.4, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(197, 160, 89, ${0.18 * visibility})`;
          ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(node.px, node.py, size, 0, Math.PI * 2);

        if (isHovered || node.isGoldAccent) {
          ctx.fillStyle = `rgba(197, 160, 89, ${Math.min(depthAlpha * 1.3, 1.0) * visibility})`;
        } else {
          ctx.fillStyle = `rgba(255, 255, 255, ${depthAlpha * visibility})`;
        }
        ctx.fill();

        // Bright core belongs to the globe read only; a formed letter dot is
        // already a solid, evenly weighted mark.
        if (zNorm > 0.35 && f < 0.35 && node.tier === 'primary') {
          ctx.beginPath();
          ctx.arc(node.px, node.py, size * 0.45, 0, Math.PI * 2);
          ctx.fillStyle = isHovered ? '#FFFFFF' : 'rgba(255, 255, 255, 0.95)';
          ctx.fill();
        }
      });

      if (!prefersReducedMotion) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    if (prefersReducedMotion) {
      staticRenderReady = true;
      render();
    } else {
      animationFrameId = requestAnimationFrame(render);
    }

    return () => {
      disposed = true;
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      if (containerEl) {
        containerEl.removeEventListener('mousemove', handleMouseMove);
        containerEl.removeEventListener('mouseleave', handleMouseLeave);
        resizeObserver.disconnect();
      }
    };
  }, [prefersReducedMotion]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full min-h-[500px] lg:min-h-[660px] flex items-center justify-center select-none overflow-hidden ${className}`}
      aria-label="Interactive Global Mining Network Globe and Signal Story Visualization"
    >
      {/* Background Radial Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(197,160,89,0.09)_0%,rgba(11,13,14,0)_70%)] pointer-events-none" />
      <div className="absolute inset-0 bg-grid-pattern opacity-30 pointer-events-none" />

      {/* Canvas Layer */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full block z-0 cursor-crosshair"
      />

      {/* Interactive Editorial Node Label Overlay */}
      {hoveredNode && (
        <div
          className="absolute z-20 pointer-events-none transform -translate-x-1/2 -translate-y-full mb-3 transition-all duration-200 ease-out"
          style={{
            left: `${hoveredNode.x}%`,
            top: `${hoveredNode.y}%`,
          }}
        >
          <div className="flex items-center gap-2 bg-[#0B0D0E]/90 border border-[#C5A059]/40 backdrop-blur-md px-3 py-1.5 rounded-sm shadow-xl">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C5A059] animate-ping" />
            <span className="font-mono text-[0.65rem] tracking-[0.2em] uppercase text-[#F4F4F0] font-medium">
              {hoveredNode.label}
            </span>
            <span className="text-[0.6rem] font-mono text-stone-500">// ACTIVE</span>
          </div>
        </div>
      )}



      {/* Ambient Editorial Fragment */}
      <div className="absolute bottom-4 left-4 pointer-events-none hidden md:block z-10">
        <span className="font-serif italic text-xs text-white/30 tracking-wider">
          Global Network • Discovery • Story • The World
        </span>
      </div>
    </div>
  );
}
