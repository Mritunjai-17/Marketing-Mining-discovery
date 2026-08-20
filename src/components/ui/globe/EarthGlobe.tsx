"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { buildEarthTextures } from "./earthTexture";
import {
  atmosphereFragmentShader,
  atmosphereVertexShader,
  earthFragmentShader,
  earthVertexShader,
} from "./shaders";

export interface GlobeAnchor {
  id: string;
  lat: number;
  lng: number;
}

export interface ProjectedAnchor {
  id: string;
  /** Surface point, in CSS pixels relative to the canvas box. */
  x: number;
  y: number;
  /** Unit vector pointing radially away from the globe centre, in screen space. */
  dirX: number;
  dirY: number;
  /** 0 when the anchor has rotated onto the far side, 1 when it faces the camera. */
  opacity: number;
}

export interface EarthGlobeProps {
  className?: string;
  /** Geographic points the caller wants projected to screen space every frame. */
  anchors?: GlobeAnchor[];
  /** Fired once per frame with projected anchors. Write to DOM refs here, never to state. */
  onProject?: (anchors: ProjectedAnchor[]) => void;
  /** Fired once the textures are built and the first frame has rendered. */
  onReady?: () => void;
  /** Seconds for one full revolution. */
  rotationPeriod?: number;
  /** Longitude facing the camera on first paint. */
  initialLongitude?: number;
}

/** Vertical field of view, kept narrow so a planet-scale sphere reads near-orthographic. */
const FOV = 20;
/** Fraction of the canvas box the sphere silhouette fills, leaving room for the haze. */
const FIT = 0.9;

/** Radians the spin axis leans, close to the real 23.4 degree obliquity. */
const AXIAL_TILT = THREE.MathUtils.degToRad(-19);
/**
 * Radians of pitch. The container only leaves a shallow cap of the sphere on screen, and
 * a negative pitch swings the populated northern mid-latitudes up into it — at 0 the cap
 * shows little but the Arctic, and GlobeHero's markers would sit below the crop for most
 * of every revolution. Tuned together with AXIAL_TILT (which is applied first, so the two
 * interact) to keep one to three markers on screen at all times.
 */
const VIEW_PITCH = THREE.MathUtils.degToRad(-15);

/**
 * Converts a coordinate to a point on the unit sphere using the same convention as
 * THREE.SphereGeometry UVs, so markers land exactly on their painted landmass.
 * With phiStart = 0, u = 0 maps to (-1, 0, 0), which is longitude -180.
 */
function latLngToVector3(lat: number, lng: number, target = new THREE.Vector3()) {
  const phi = THREE.MathUtils.degToRad(lng + 180);
  const theta = THREE.MathUtils.degToRad(90 - lat);
  const sinTheta = Math.sin(theta);
  return target.set(
    -Math.cos(phi) * sinTheta,
    Math.cos(theta),
    Math.sin(phi) * sinTheta
  );
}

function smoothstep(edge0: number, edge1: number, x: number) {
  const t = Math.min(Math.max((x - edge0) / (edge1 - edge0), 0), 1);
  return t * t * (3 - 2 * t);
}

export const EarthGlobe: React.FC<EarthGlobeProps> = ({
  className = "",
  anchors,
  onProject,
  onReady,
  rotationPeriod = 46,
  initialLongitude = 18,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Props consumed inside the render loop live in refs so changing them never
  // tears down the WebGL context.
  const onProjectRef = useRef(onProject);
  const onReadyRef = useRef(onReady);
  const anchorsRef = useRef(anchors);
  const rotationPeriodRef = useRef(rotationPeriod);

  useEffect(() => {
    onProjectRef.current = onProject;
    onReadyRef.current = onReady;
    anchorsRef.current = anchors;
    rotationPeriodRef.current = rotationPeriod;
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let disposed = false;
    let frameId: number | null = null;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
        powerPreference: "high-performance",
      });
    } catch {
      // No WebGL: the hero degrades to typography on a plain card.
      return;
    }

    const isSmallViewport = window.matchMedia("(max-width: 767px)").matches;
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    renderer.setClearAlpha(0);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.06;
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    const scene = new THREE.Scene();

    const halfFov = THREE.MathUtils.degToRad(FOV) / 2;
    const silhouetteAngle = Math.atan(FIT * Math.tan(halfFov));
    const camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 100);
    camera.position.set(0, 0, 1 / Math.sin(silhouetteAngle));
    camera.lookAt(0, 0, 0);

    // tiltGroup carries the viewing pitch and axial lean; the earth spins inside it.
    const tiltGroup = new THREE.Group();
    tiltGroup.rotation.set(VIEW_PITCH, 0, AXIAL_TILT);
    scene.add(tiltGroup);

    const sunDirection = new THREE.Vector3(-0.62, 0.34, 0.7).normalize();

    // --- Atmosphere shell -------------------------------------------------------
    // Front-faced and depth-test free, so the haze washes over the limb of the earth
    // and fades to nothing at the centre of the disc.
    const ATMOSPHERE_RADIUS = 1.035;
    const atmosphereGeometry = new THREE.SphereGeometry(ATMOSPHERE_RADIUS, 96, 64);
    const atmosphereMaterial = new THREE.ShaderMaterial({
      vertexShader: atmosphereVertexShader,
      fragmentShader: atmosphereFragmentShader,
      uniforms: {
        uColor: { value: new THREE.Color("#8FB3D9") },
        uSunDirection: { value: sunDirection },
        uStrength: { value: 0.12 },
        uLimb: { value: Math.sqrt(1 - 1 / (ATMOSPHERE_RADIUS * ATMOSPHERE_RADIUS)) },
        uInnerFalloff: { value: 14 },
      },
      transparent: true,
      depthWrite: false,
      depthTest: false,
      side: THREE.FrontSide,
    });
    const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
    atmosphere.renderOrder = 10;
    tiltGroup.add(atmosphere);

    // --- Earth ------------------------------------------------------------------
    const earthGeometry = new THREE.SphereGeometry(
      1,
      isSmallViewport ? 96 : 160,
      isSmallViewport ? 64 : 96
    );
    // Placeholder until the textures finish building; swapped out in the promise below.
    const placeholderMaterial = new THREE.MeshBasicMaterial({ visible: false });
    const earth = new THREE.Mesh<THREE.SphereGeometry, THREE.Material>(
      earthGeometry,
      placeholderMaterial
    );
    earth.rotation.y = THREE.MathUtils.degToRad(-(initialLongitude + 90));
    earth.visible = false;
    tiltGroup.add(earth);

    let earthMaterial: THREE.ShaderMaterial | null = null;
    let dayTexture: THREE.CanvasTexture | null = null;
    let maskTexture: THREE.CanvasTexture | null = null;

    // --- Sizing -----------------------------------------------------------------
    let width = canvas.clientWidth || 1;
    let height = canvas.clientHeight || 1;

    const applySize = () => {
      width = Math.max(canvas.clientWidth, 1);
      height = Math.max(canvas.clientHeight, 1);

      // The box is deliberately far wider than the viewport, so a raw devicePixelRatio
      // would allocate an enormous framebuffer. Cap the longest drawing-buffer edge; the
      // globe is smooth-gradient heavy and holds up well below 2x.
      const maxEdge = isSmallViewport ? 2200 : 3000;
      const ratioCap = maxEdge / Math.max(width, height);
      renderer.setPixelRatio(
        Math.max(1, Math.min(window.devicePixelRatio || 1, isSmallViewport ? 1.75 : 2, ratioCap))
      );

      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    };
    applySize();

    // --- Anchor projection ------------------------------------------------------
    const anchorBase = new Map<string, THREE.Vector3>();
    const worldPoint = new THREE.Vector3();
    const surfaceNormal = new THREE.Vector3();
    const toCamera = new THREE.Vector3();
    const projected = new THREE.Vector3();
    const outerPoint = new THREE.Vector3();
    const results: ProjectedAnchor[] = [];

    const projectAnchors = () => {
      const list = anchorsRef.current;
      const report = onProjectRef.current;
      if (!list || !list.length || !report) return;

      results.length = 0;
      earth.updateMatrixWorld();

      for (const anchor of list) {
        let base = anchorBase.get(anchor.id);
        if (!base) {
          base = latLngToVector3(anchor.lat, anchor.lng);
          anchorBase.set(anchor.id, base);
        }

        worldPoint.copy(base).applyMatrix4(earth.matrixWorld);
        // The globe sits at the world origin, so the position doubles as the normal.
        surfaceNormal.copy(worldPoint).normalize();
        toCamera.copy(camera.position).sub(worldPoint).normalize();

        const facing = surfaceNormal.dot(toCamera);

        projected.copy(worldPoint).project(camera);
        const x = (projected.x * 0.5 + 0.5) * width;
        const y = (-projected.y * 0.5 + 0.5) * height;

        outerPoint.copy(worldPoint).addScaledVector(surfaceNormal, 0.3).project(camera);
        let dirX = (outerPoint.x * 0.5 + 0.5) * width - x;
        let dirY = (-outerPoint.y * 0.5 + 0.5) * height - y;
        const length = Math.hypot(dirX, dirY) || 1;
        dirX /= length;
        dirY /= length;

        results.push({
          id: anchor.id,
          x,
          y,
          dirX,
          dirY,
          // Anything with facing > 0 is on the near side. The cap the hero leaves visible
          // sits near the top of the sphere, where normals point up and away from the
          // camera, so this has to stay low — a high threshold would fade out pins that
          // are plainly on screen. It only needs to catch the silhouette, where facing → 0.
          opacity: smoothstep(0.03, 0.16, facing),
        });
      }

      report(results);
    };

    const renderFrame = (delta: number) => {
      if (delta > 0) {
        earth.rotation.y += (delta * Math.PI * 2) / rotationPeriodRef.current;
      }
      renderer.render(scene, camera);
      projectAnchors();
    };

    // --- Loop -------------------------------------------------------------------
    let lastTime = 0;
    let running = false;
    let inViewport = true;

    const tick = (now: number) => {
      if (disposed) return;
      // Clamped so a backgrounded tab does not resume with a visible jump.
      const delta = lastTime ? Math.min((now - lastTime) / 1000, 0.05) : 0;
      lastTime = now;
      renderFrame(delta);
      frameId = requestAnimationFrame(tick);
    };

    const start = () => {
      if (running || disposed || !earthMaterial) return;
      running = true;
      lastTime = 0;
      frameId = requestAnimationFrame(tick);
    };

    const stop = () => {
      running = false;
      if (frameId !== null) {
        cancelAnimationFrame(frameId);
        frameId = null;
      }
    };

    const syncRunState = () => {
      if (prefersReducedMotion) return;
      if (inViewport && document.visibilityState === "visible") start();
      else stop();
    };

    const resizeObserver = new ResizeObserver(() => {
      applySize();
      // Keep a paused globe (reduced motion, or scrolled out of view) in sync.
      if (!running) renderFrame(0);
    });
    resizeObserver.observe(canvas);

    const intersectionObserver = new IntersectionObserver(
      (entries) => {
        inViewport = entries.some((entry) => entry.isIntersecting);
        syncRunState();
      },
      { threshold: 0 }
    );
    intersectionObserver.observe(canvas);

    document.addEventListener("visibilitychange", syncRunState);

    // --- Async texture build ----------------------------------------------------
    buildEarthTextures(isSmallViewport ? 2048 : 4096)
      .then(({ day, mask }) => {
        if (disposed) return;

        const maxAnisotropy = renderer.capabilities.getMaxAnisotropy();

        dayTexture = new THREE.CanvasTexture(day);
        dayTexture.colorSpace = THREE.SRGBColorSpace;
        dayTexture.wrapS = THREE.RepeatWrapping;
        dayTexture.wrapT = THREE.ClampToEdgeWrapping;
        dayTexture.anisotropy = maxAnisotropy;

        maskTexture = new THREE.CanvasTexture(mask);
        maskTexture.colorSpace = THREE.NoColorSpace;
        maskTexture.wrapS = THREE.RepeatWrapping;
        maskTexture.wrapT = THREE.ClampToEdgeWrapping;
        maskTexture.anisotropy = maxAnisotropy;

        earthMaterial = new THREE.ShaderMaterial({
          vertexShader: earthVertexShader,
          fragmentShader: earthFragmentShader,
          uniforms: {
            uDayMap: { value: dayTexture },
            uMaskMap: { value: maskTexture },
            uMaskTexel: { value: new THREE.Vector2(1 / mask.width, 1 / mask.height) },
            uSunDirection: { value: sunDirection },
            uHazeColor: { value: new THREE.Color("#7FA6CE") },
            uCityLightColor: { value: new THREE.Color("#FFCC85") },
            uAmbient: { value: 0.11 },
            uSunIntensity: { value: 1.02 },
            uReliefStrength: { value: 0.22 },
            uCityLightStrength: { value: 0.5 },
            uHazeStrength: { value: 0.34 },
          },
        });

        earth.material = earthMaterial;
        earth.visible = true;

        renderFrame(0);
        onReadyRef.current?.();

        if (prefersReducedMotion) return;
        syncRunState();
      })
      .catch(() => {
        /* Texture build failed; the hero stays readable without the globe. */
      });

    return () => {
      disposed = true;
      stop();
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      document.removeEventListener("visibilitychange", syncRunState);

      earthGeometry.dispose();
      atmosphereGeometry.dispose();
      atmosphereMaterial.dispose();
      placeholderMaterial.dispose();
      earthMaterial?.dispose();
      dayTexture?.dispose();
      maskTexture?.dispose();
      renderer.dispose();
    };
  }, [initialLongitude]);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
};

export default EarthGlobe;
