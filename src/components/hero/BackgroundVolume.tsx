import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo } from 'react';
import * as THREE from 'three';

import { heroConfig } from '@/config/heroConfig';
import backgroundFragmentShader from '@/shaders/backgroundVolume.frag?raw';
import backgroundVertexShader from '@/shaders/backgroundVolume.vert?raw';

type BackgroundVolumeProps = {
  reducedMotion: boolean;
};

export function BackgroundVolume({ reducedMotion }: BackgroundVolumeProps) {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: backgroundVertexShader,
        fragmentShader: backgroundFragmentShader,
        depthWrite: false,
        depthTest: false,
        uniforms: {
          uTime: { value: 0 },
          uNoiseAmplitude: { value: heroConfig.background.noiseAmplitude },
          uNoiseSpeed: { value: heroConfig.background.noiseSpeed },
          uBaseColor: { value: new THREE.Color(heroConfig.scene.clearColor) },
          uCenterColor: { value: new THREE.Color(heroConfig.background.centerColor) },
          uAccentColor: { value: new THREE.Color(heroConfig.background.accentColor) },
        },
      }),
    [],
  );

  useEffect(() => () => material.dispose(), [material]);

  useFrame(({ clock }) => {
    material.uniforms.uTime.value = reducedMotion ? 0 : clock.getElapsedTime();
  });

  return (
    <mesh position={[0, 0, -4.8]} scale={[16, 12, 1]} renderOrder={-1}>
      <planeGeometry args={[1, 1]} />
      <primitive attach="material" object={material} />
    </mesh>
  );
}
