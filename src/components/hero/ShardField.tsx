import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';

import { heroConfig } from '@/config/heroConfig';
import { createInnerShardMaterial } from '@/lib/materials/createInnerShardMaterial';
import { sampleInteriorAnchors } from '@/lib/glyph/sampleInteriorAnchors';
import { clamp } from '@/lib/math/clamp';
import type { GlyphBuildResult, GlyphId, GlyphInteractionState, QualityTier } from '@/types/hero';

type ShardFieldProps = {
  id: GlyphId;
  glyph: GlyphBuildResult;
  qualityTier: QualityTier;
  reducedMotion: boolean;
  interaction: GlyphInteractionState;
};

const tempObject = new THREE.Object3D();
const tempVector = new THREE.Vector3();
const tangentVector = new THREE.Vector3();

export function ShardField({ id, glyph, qualityTier, reducedMotion, interaction }: ShardFieldProps) {
  const instancedMeshRef = useRef<THREE.InstancedMesh>(null);

  const geometry = useMemo(() => new THREE.TetrahedronGeometry(1, 0), []);
  const material = useMemo(() => createInnerShardMaterial(), []);
  const shardCount = heroConfig.debug.lowShardCount
    ? Math.max(8, Math.round(heroConfig.shards.counts[qualityTier][id] * 0.35))
    : heroConfig.shards.counts[qualityTier][id];
  const shards = useMemo(
    () => sampleInteriorAnchors(id, glyph.polygons, glyph.bounds, shardCount),
    [glyph.bounds, glyph.polygons, id, shardCount],
  );

  useEffect(() => {
    const mesh = instancedMeshRef.current;
    if (!mesh) {
      return;
    }

    mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);

    const baseColor = new THREE.Color('#d8e7ff');
    const accentColor = new THREE.Color('#9ec5ff');

    shards.forEach((shard, index) => {
      mesh.setColorAt(index, baseColor.clone().lerp(accentColor, shard.colorBias * 0.65));
    });

    if (mesh.instanceColor) {
      mesh.instanceColor.needsUpdate = true;
    }
  }, [shards]);

  useEffect(
    () => () => {
      geometry.dispose();
      material.dispose();
    },
    [geometry, material],
  );

  useFrame(({ clock }) => {
    const mesh = instancedMeshRef.current;
    if (!mesh || heroConfig.debug.freezeTime) {
      return;
    }

    const time = clock.getElapsedTime();
    const ambientMultiplier = reducedMotion || heroConfig.debug.disableAmbientMotion ? 0.22 : 1;
    const interactionMultiplier = heroConfig.debug.disableInteraction ? 0 : interaction.impulseCurrent;
    const interactionPoint = interaction.localPoint;

    for (let index = 0; index < shards.length; index += 1) {
      const shard = shards[index];

      const ambientWave = Math.sin(time * shard.speed + shard.phase);
      const ambientWaveB = Math.cos(time * shard.speed * 0.82 + shard.phase * 1.3);

      tempVector.set(
        shard.orbitAxis.x * ambientWave * heroConfig.motion.ambientOrbit * ambientMultiplier,
        shard.orbitAxis.y * ambientWaveB * heroConfig.motion.ambientOrbit * ambientMultiplier,
        shard.orbitAxis.z * ambientWave * heroConfig.motion.ambientDepthDrift * ambientMultiplier,
      );

      if (interactionPoint && interactionMultiplier > 0.0001) {
        tangentVector.copy(shard.basePosition).sub(interactionPoint);
        const distance = Math.max(tangentVector.length(), 1e-4);

        if (distance < heroConfig.interaction.radius * 1.4) {
          const influence = 1 - distance / (heroConfig.interaction.radius * 1.4);
          tangentVector.normalize();

          const swirl = new THREE.Vector3()
            .copy(shard.orbitAxis)
            .cross(tangentVector)
            .normalize()
            .multiplyScalar(influence * interactionMultiplier * heroConfig.interaction.swirl * 0.8);

          tempVector.addScaledVector(
            tangentVector,
            influence * interactionMultiplier * heroConfig.interaction.force * 1.1,
          );
          tempVector.add(swirl);
        }
      }

      if (tempVector.length() > 0.09) {
        tempVector.setLength(0.09);
      }

      tempObject.position.copy(shard.basePosition).add(tempVector);

      const compression = 1 - heroConfig.motion.compressionPulse * interactionMultiplier * 0.45;
      const scale = shard.baseScale * (compression + interactionMultiplier * 0.12);
      tempObject.scale.setScalar(clamp(scale, heroConfig.shards.size.min * 0.8, heroConfig.shards.size.max * 1.6));
      tempObject.rotation.set(
        shard.seed * Math.PI + time * shard.speed * 0.42,
        shard.phase + time * shard.speed * 0.68,
        shard.seed * Math.PI * 2 + time * shard.speed,
      );
      tempObject.updateMatrix();

      mesh.setMatrixAt(index, tempObject.matrix);
    }

    mesh.instanceMatrix.needsUpdate = true;
  });

  const boundsCenterX = (glyph.bounds.minX + glyph.bounds.maxX) * 0.5;
  const boundsCenterY = (glyph.bounds.minY + glyph.bounds.maxY) * 0.5;

  return (
    <>
      <instancedMesh ref={instancedMeshRef} args={[geometry, material, shards.length]} />
      {heroConfig.debug.enabled && heroConfig.debug.showShardBounds ? (
        <mesh position={[boundsCenterX, boundsCenterY, 0]}>
          <boxGeometry args={[glyph.bounds.width, glyph.bounds.height, heroConfig.geometry.depth]} />
          <meshBasicMaterial color="#3f7dd8" wireframe transparent opacity={0.18} />
        </mesh>
      ) : null}
    </>
  );
}
