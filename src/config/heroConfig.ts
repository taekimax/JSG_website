import type { HeroConfig } from '@/types/hero';

export const heroConfig: HeroConfig = {
  scene: {
    clearColor: '#05060a',
  },
  camera: {
    fov: 24,
    near: 0.1,
    far: 20,
    position: [0, 0.03, 6.2],
    target: [0, 0, 0],
    responsivePosition: {
      desktop: [0, 0.03, 6.2],
      tablet: [0, 0.04, 6.55],
      mobile: [0, 0.05, 6.95],
    },
    idleDrift: {
      enabled: true,
      rotX: 0.0045,
      rotY: 0.006,
      speed: 0.06,
    },
  },
  layout: {
    representativeGlyphWidth: 0.7,
    gapRatioDesktop: 0.21,
    gapRatioTablet: 0.195,
    gapRatioMobile: 0.18,
    groupScale: {
      desktop: 2.5,
      tablet: 2.15,
      mobile: 1.78,
    },
    targetWidthRatio: {
      desktop: 0.56,
      tablet: 0.64,
      mobile: 0.8,
    },
    maxHeightRatio: {
      desktop: 0.72,
      tablet: 0.72,
      mobile: 0.72,
    },
    groupCenterY: 0,
    baselineY: 0,
  },
  geometry: {
    depth: 0.22,
    steps: 1,
    bevelEnabled: true,
    bevelSegments: 2,
    bevelSize: 0.012,
    bevelThickness: 0.016,
    curveSegments: {
      high: 16,
      medium: 12,
      reduced: 10,
    },
  },
  anchors: {
    edgeMargin: 0.05,
    zMin: -0.07,
    zMax: 0.07,
    maxAttemptsMultiplier: 90,
  },
  background: {
    centerColor: '#0a0d12',
    accentColor: '#163055',
    noiseAmplitude: 0.02,
    noiseSpeed: 0.02,
  },
  motion: {
    ambientOrbit: 0.024,
    ambientDepthDrift: 0.016,
    compressionPulse: 0.02,
    settleLambda: 11,
    shellStressDecay: 12,
  },
  interaction: {
    radius: 0.22,
    force: 0.085,
    swirl: 0.022,
    clickImpulse: 1.0,
    moveImpulseMultiplier: 0.0025,
    neighborFalloff: 0.12,
  },
  shards: {
    counts: {
      high: { J: 52, S: 68, G: 72 },
      medium: { J: 34, S: 46, G: 52 },
      reduced: { J: 20, S: 28, G: 32 },
    },
    size: {
      min: 0.026,
      max: 0.05,
    },
  },
  materials: {
    shell: {
      roughness: 0.08,
      transmission: 0.92,
      thickness: 0.28,
      ior: 1.16,
      clearcoat: 1,
      clearcoatRoughness: 0.06,
      opacity: 0.82,
      edgeStrength: 0.48,
      accentStrength: 0.16,
    },
    shards: {
      roughness: 0.12,
      metalness: 0,
      opacity: 0.94,
      emissiveIntensity: 1.05,
    },
  },
  quality: {
    dpr: {
      high: 1.5,
      medium: 1.25,
      reduced: 1,
    },
  },
  debug: {
    enabled: import.meta.env.DEV,
    showBounds: false,
    showInteractionPoint: false,
    showShardBounds: false,
    freezeTime: false,
    isolateGlyph: null,
    lowShardCount: false,
    disableAmbientMotion: false,
    disableInteraction: false,
  },
};
