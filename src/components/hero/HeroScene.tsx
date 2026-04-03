import { useFrame, useThree } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

import { BackgroundVolume } from '@/components/hero/BackgroundVolume';
import { GlyphGroup } from '@/components/hero/GlyphGroup';
import { heroConfig } from '@/config/heroConfig';
import { computeGlyphLayout } from '@/lib/glyph/glyphLayout';
import { computeMoveImpulse } from '@/lib/motion/impulse';
import type { GlyphId, GlyphInteractionState, HeroPointerState, QualityTier } from '@/types/hero';

type HeroSceneProps = {
  reducedMotion: boolean;
  qualityTier: QualityTier;
  pointerRef: React.MutableRefObject<HeroPointerState>;
};

function createInteractionState(): Record<GlyphId, GlyphInteractionState> {
  return {
    J: {
      isHovered: false,
      localPoint: null,
      impulseTarget: 0,
      impulseCurrent: 0,
      stressTarget: 0,
      stressCurrent: 0,
      activeUntil: 0,
    },
    S: {
      isHovered: false,
      localPoint: null,
      impulseTarget: 0,
      impulseCurrent: 0,
      stressTarget: 0,
      stressCurrent: 0,
      activeUntil: 0,
    },
    G: {
      isHovered: false,
      localPoint: null,
      impulseTarget: 0,
      impulseCurrent: 0,
      stressTarget: 0,
      stressCurrent: 0,
      activeUntil: 0,
    },
  };
}

export function HeroScene({ reducedMotion, qualityTier, pointerRef }: HeroSceneProps) {
  const { camera, scene, raycaster, size } = useThree();
  const layout = useMemo(() => computeGlyphLayout(size.width, size.height), [size.height, size.width]);
  const interactionStateRef = useRef(createInteractionState());
  const pointerVector = useRef(new THREE.Vector2(99, 99));
  const meshRegistryRef = useRef<Record<GlyphId, THREE.Mesh | null>>({
    J: null,
    S: null,
    G: null,
  });

  scene.background = new THREE.Color(heroConfig.scene.clearColor);

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();
    const pointer = pointerRef.current;
    const now = performance.now();

    const baseCameraPosition = layout.cameraPosition;
    camera.position.set(baseCameraPosition[0], baseCameraPosition[1], baseCameraPosition[2]);

    if (!reducedMotion && heroConfig.camera.idleDrift.enabled) {
      camera.position.x += Math.sin(time * heroConfig.camera.idleDrift.speed) * 0.06;
      camera.position.y += Math.cos(time * heroConfig.camera.idleDrift.speed * 0.9) * 0.04;
    }

    camera.lookAt(
      heroConfig.camera.target[0],
      heroConfig.camera.target[1],
      heroConfig.camera.target[2],
    );

    const interactions = interactionStateRef.current;
    const activeMeshes = Object.values(meshRegistryRef.current).filter(Boolean) as THREE.Mesh[];
    let activeId: GlyphId | null = null;
    let localPoint: THREE.Vector3 | null = null;

    if (
      !heroConfig.debug.disableInteraction &&
      activeMeshes.length > 0 &&
      Math.abs(pointer.ndc.x) <= 1 &&
      Math.abs(pointer.ndc.y) <= 1
    ) {
      pointerVector.current.set(pointer.ndc.x, pointer.ndc.y);
      raycaster.setFromCamera(pointerVector.current, camera);
      const hit = raycaster.intersectObjects(activeMeshes, false)[0];

      if (hit?.object?.userData?.glyphId) {
        activeId = hit.object.userData.glyphId as GlyphId;
        localPoint = hit.object.worldToLocal(hit.point.clone());
      }
    }

    const clickImpulseActive = pointer.isDown && now - pointer.lastTapAt < 180;

    (Object.keys(interactions) as GlyphId[]).forEach((glyphId) => {
      const interaction = interactions[glyphId];
      interaction.isHovered = glyphId === activeId;

      if (glyphId === activeId && localPoint) {
        const moveImpulse = computeMoveImpulse(
          pointer.velocity,
          heroConfig.interaction.moveImpulseMultiplier,
          heroConfig.interaction.clickImpulse,
        );
        const clickImpulse = clickImpulseActive ? heroConfig.interaction.clickImpulse : 0;
        const nextImpulse = Math.min(
          heroConfig.interaction.clickImpulse,
          Math.max(interaction.impulseTarget * 0.6, moveImpulse + clickImpulse),
        );

        interaction.localPoint = localPoint.clone();
        interaction.impulseTarget = Math.max(interaction.impulseTarget, nextImpulse);
        interaction.stressTarget = Math.max(interaction.stressTarget, 0.16 + nextImpulse * 0.84);
        interaction.activeUntil = now + 180;
      } else {
        if (activeId && now < interactions[activeId].activeUntil) {
          const neighborImpulse = interactions[activeId].impulseTarget * heroConfig.interaction.neighborFalloff;
          interaction.impulseTarget = Math.max(interaction.impulseTarget, neighborImpulse * 0.45);
          interaction.stressTarget = Math.max(interaction.stressTarget, neighborImpulse * 0.5);
        }

        if (now > interaction.activeUntil && interaction.impulseTarget < 0.001) {
          interaction.localPoint = null;
        }
      }
    });
  });

  return (
    <>
      <BackgroundVolume reducedMotion={reducedMotion} />
      <ambientLight intensity={0.18} />
      <directionalLight position={[1.2, 1.8, 2.4]} intensity={1.05} />
      <directionalLight position={[-2.0, 0.7, 1.5]} intensity={0.34} />
      <directionalLight position={[0.8, 0.6, -2.0]} intensity={0.48} />
      <GlyphGroup
        specs={layout.specs}
        groupOffsetY={layout.groupOffsetY}
        groupScale={layout.groupScale}
        qualityTier={qualityTier}
        reducedMotion={reducedMotion}
        interactions={interactionStateRef.current}
        onMeshReady={(id, mesh) => {
          meshRegistryRef.current[id] = mesh;
        }}
      />
    </>
  );
}
