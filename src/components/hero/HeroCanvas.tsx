import { Preload } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { useMemo } from 'react';

import { HeroFallback } from '@/components/hero/HeroFallback';
import { HeroScene } from '@/components/hero/HeroScene';
import { heroConfig } from '@/config/heroConfig';
import type { HeroPointerState, QualityTier } from '@/types/hero';

type HeroCanvasProps = {
  reducedMotion: boolean;
  qualityTier: QualityTier;
  pointerRef: React.MutableRefObject<HeroPointerState>;
};

function supportsWebGL() {
  try {
    const canvas = document.createElement('canvas');
    return Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl'));
  } catch {
    return false;
  }
}

export function HeroCanvas({ reducedMotion, qualityTier, pointerRef }: HeroCanvasProps) {
  const webglAvailable = useMemo(() => supportsWebGL(), []);

  if (!webglAvailable) {
    return <HeroFallback />;
  }

  return (
    <Canvas
      dpr={[1, heroConfig.quality.dpr[qualityTier]]}
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      }}
      camera={{
        fov: heroConfig.camera.fov,
        near: heroConfig.camera.near,
        far: heroConfig.camera.far,
        position: heroConfig.camera.position,
      }}
      fallback={<HeroFallback />}
    >
      <HeroScene reducedMotion={reducedMotion} qualityTier={qualityTier} pointerRef={pointerRef} />
      <Preload all />
    </Canvas>
  );
}
