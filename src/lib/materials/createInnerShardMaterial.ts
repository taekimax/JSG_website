import * as THREE from 'three';

import { heroConfig } from '@/config/heroConfig';

export function createInnerShardMaterial() {
  return new THREE.MeshStandardMaterial({
    color: '#d8e7ff',
    emissive: '#9ec5ff',
    emissiveIntensity: heroConfig.materials.shards.emissiveIntensity,
    roughness: heroConfig.materials.shards.roughness,
    metalness: heroConfig.materials.shards.metalness,
    transparent: true,
    opacity: heroConfig.materials.shards.opacity,
    depthWrite: false,
  });
}
