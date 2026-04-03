import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

import { heroConfig } from '@/config/heroConfig';
import { ShardField } from '@/components/hero/ShardField';
import { buildGlyphShapes } from '@/lib/glyph/buildGlyphShapes';
import { damp } from '@/lib/motion/damping';
import { createOuterShellMaterial } from '@/lib/materials/createOuterShellMaterial';
import type { GlyphId, GlyphInteractionState, GlyphSpec, QualityTier } from '@/types/hero';

type GlyphObjectProps = {
  id: GlyphId;
  spec: GlyphSpec;
  qualityTier: QualityTier;
  reducedMotion: boolean;
  interaction: GlyphInteractionState;
  onMeshReady: (id: GlyphId, mesh: THREE.Mesh | null) => void;
};

export function GlyphObject({
  id,
  spec,
  qualityTier,
  reducedMotion,
  interaction,
  onMeshReady,
}: GlyphObjectProps) {
  const groupRef = useRef<THREE.Group>(null);
  const shellRef = useRef<THREE.Mesh>(null);
  const glyph = useMemo(() => buildGlyphShapes(id, qualityTier), [id, qualityTier]);
  const shellMaterial = useMemo(() => createOuterShellMaterial(), []);

  useEffect(() => {
    onMeshReady(id, shellRef.current);
    return () => onMeshReady(id, null);
  }, [id, onMeshReady]);

  useEffect(
    () => () => {
      shellMaterial.dispose();
    },
    [shellMaterial],
  );

  useFrame(({ clock }, delta) => {
    interaction.impulseCurrent = damp(
      interaction.impulseCurrent,
      interaction.impulseTarget,
      heroConfig.motion.settleLambda,
      delta,
    );
    interaction.stressCurrent = damp(
      interaction.stressCurrent,
      interaction.stressTarget,
      heroConfig.motion.shellStressDecay,
      delta,
    );

    interaction.impulseTarget *= reducedMotion ? 0.78 : 0.88;
    interaction.stressTarget *= 0.9;

    const shader = shellMaterial.userData.shader as { uniforms: Record<string, unknown> } | undefined;
    const uniforms = shellMaterial.userData.uniforms as
      | {
          uStress: { value: number };
          uInteractionPointLocal: { value: THREE.Vector3 };
        }
      | undefined;

    if (shader && uniforms) {
      uniforms.uStress.value = interaction.stressCurrent;
      uniforms.uInteractionPointLocal.value.copy(
        interaction.localPoint ?? new THREE.Vector3(999, 999, 999),
      );
    }

    if (groupRef.current) {
      const time = clock.getElapsedTime();
      const idleTilt = reducedMotion ? 0 : Math.sin(time * 0.35 + spec.position[0]) * 0.003;
      groupRef.current.rotation.x = idleTilt;
      groupRef.current.rotation.y = interaction.impulseCurrent * 0.01;
      groupRef.current.scale.setScalar(1 + interaction.impulseCurrent * 0.004);
    }
  });

  const boundsCenterX = (glyph.bounds.minX + glyph.bounds.maxX) * 0.5;
  const boundsCenterY = (glyph.bounds.minY + glyph.bounds.maxY) * 0.5;

  return (
    <group ref={groupRef} position={spec.position}>
      <ShardField
        id={id}
        glyph={glyph}
        qualityTier={qualityTier}
        reducedMotion={reducedMotion}
        interaction={interaction}
      />
      <mesh ref={shellRef} geometry={glyph.geometry} material={shellMaterial} userData={{ glyphId: id }} />
      {heroConfig.debug.enabled && heroConfig.debug.showBounds ? (
        <mesh position={[boundsCenterX, boundsCenterY, 0]}>
          <boxGeometry args={[glyph.bounds.width, glyph.bounds.height, heroConfig.geometry.depth]} />
          <meshBasicMaterial color="#e7f1ff" wireframe transparent opacity={0.14} />
        </mesh>
      ) : null}
      {heroConfig.debug.enabled && heroConfig.debug.showInteractionPoint && interaction.localPoint ? (
        <mesh position={interaction.localPoint}>
          <sphereGeometry args={[0.02, 8, 8]} />
          <meshBasicMaterial color="#8ac6ff" />
        </mesh>
      ) : null}
    </group>
  );
}
