import type * as THREE from 'three';

import { GlyphObject } from '@/components/hero/GlyphObject';
import { heroConfig } from '@/config/heroConfig';
import type { GlyphId, GlyphInteractionState, GlyphSpec, QualityTier } from '@/types/hero';

type GlyphGroupProps = {
  specs: GlyphSpec[];
  groupOffsetY: number;
  groupScale: number;
  qualityTier: QualityTier;
  reducedMotion: boolean;
  interactions: Record<GlyphId, GlyphInteractionState>;
  onMeshReady: (id: GlyphId, mesh: THREE.Mesh | null) => void;
};

export function GlyphGroup({
  specs,
  groupOffsetY,
  groupScale,
  qualityTier,
  reducedMotion,
  interactions,
  onMeshReady,
}: GlyphGroupProps) {
  const visibleSpecs = heroConfig.debug.isolateGlyph
    ? specs.filter((spec) => spec.id === heroConfig.debug.isolateGlyph)
    : specs;

  return (
    <group position={[0, groupOffsetY, 0]} scale={groupScale}>
      {visibleSpecs.map((spec) => (
        <GlyphObject
          key={spec.id}
          id={spec.id}
          spec={spec}
          qualityTier={qualityTier}
          reducedMotion={reducedMotion}
          interaction={interactions[spec.id]}
          onMeshReady={onMeshReady}
        />
      ))}
    </group>
  );
}
