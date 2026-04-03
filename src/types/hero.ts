import * as THREE from 'three';

export type GlyphId = 'J' | 'S' | 'G';
export type QualityTier = 'high' | 'medium' | 'reduced';
export type HeroBreakpoint = 'desktop' | 'tablet' | 'mobile';

export type HeroPointerState = {
  ndc: { x: number; y: number };
  viewport: { x: number; y: number };
  velocity: number;
  isDown: boolean;
  lastTapAt: number;
};

export type GlyphInteractionState = {
  isHovered: boolean;
  localPoint: THREE.Vector3 | null;
  impulseTarget: number;
  impulseCurrent: number;
  stressTarget: number;
  stressCurrent: number;
  activeUntil: number;
};

export type GlyphSpec = {
  id: GlyphId;
  width: number;
  height: number;
  depth: number;
  position: [number, number, number];
  bevelSize: number;
  bevelThickness: number;
};

export type GlyphPolygon = {
  outline: THREE.Vector2[];
  holes: THREE.Vector2[][];
};

export type GlyphBuildResult = {
  geometry: THREE.ExtrudeGeometry;
  polygons: GlyphPolygon[];
  bounds: {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
    width: number;
    height: number;
  };
  metrics: {
    width: number;
    height: number;
  };
};

export type ShardInstanceData = {
  basePosition: THREE.Vector3;
  baseScale: number;
  seed: number;
  orbitAxis: THREE.Vector3;
  phase: number;
  speed: number;
  colorBias: number;
};

export type LandingCopy = {
  kicker: string;
  leadKo: string;
  leadEn: string;
  ctaLabel: string;
  ctaSub: string;
};

export type HeroConfig = {
  scene: {
    clearColor: string;
  };
  camera: {
    fov: number;
    near: number;
    far: number;
    position: [number, number, number];
    target: [number, number, number];
    responsivePosition: Record<HeroBreakpoint, [number, number, number]>;
    idleDrift: {
      enabled: boolean;
      rotX: number;
      rotY: number;
      speed: number;
    };
  };
  layout: {
    representativeGlyphWidth: number;
    gapRatioDesktop: number;
    gapRatioTablet: number;
    gapRatioMobile: number;
    groupScale: Record<HeroBreakpoint, number>;
    targetWidthRatio: Record<HeroBreakpoint, number>;
    maxHeightRatio: Record<HeroBreakpoint, number>;
    groupCenterY: number;
    baselineY: number;
  };
  geometry: {
    depth: number;
    steps: number;
    bevelEnabled: boolean;
    bevelSegments: number;
    bevelSize: number;
    bevelThickness: number;
    curveSegments: Record<QualityTier, number>;
  };
  anchors: {
    edgeMargin: number;
    zMin: number;
    zMax: number;
    maxAttemptsMultiplier: number;
  };
  background: {
    centerColor: string;
    accentColor: string;
    noiseAmplitude: number;
    noiseSpeed: number;
  };
  motion: {
    ambientOrbit: number;
    ambientDepthDrift: number;
    compressionPulse: number;
    settleLambda: number;
    shellStressDecay: number;
  };
  interaction: {
    radius: number;
    force: number;
    swirl: number;
    clickImpulse: number;
    moveImpulseMultiplier: number;
    neighborFalloff: number;
  };
  shards: {
    counts: Record<QualityTier, Record<GlyphId, number>>;
    size: {
      min: number;
      max: number;
    };
  };
  materials: {
    shell: {
      roughness: number;
      transmission: number;
      thickness: number;
      ior: number;
      clearcoat: number;
      clearcoatRoughness: number;
      opacity: number;
      edgeStrength: number;
      accentStrength: number;
    };
    shards: {
      roughness: number;
      metalness: number;
      opacity: number;
      emissiveIntensity: number;
    };
  };
  quality: {
    dpr: Record<QualityTier, number>;
  };
  debug: {
    enabled: boolean;
    showBounds: boolean;
    showInteractionPoint: boolean;
    showShardBounds: boolean;
    freezeTime: boolean;
    isolateGlyph: GlyphId | null;
    lowShardCount: boolean;
    disableAmbientMotion: boolean;
    disableInteraction: boolean;
  };
};
