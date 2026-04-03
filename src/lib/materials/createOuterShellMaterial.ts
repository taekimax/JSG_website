import * as THREE from 'three';

import { heroConfig } from '@/config/heroConfig';
import { patchOuterShellFragmentShader, patchOuterShellVertexShader } from '@/shaders/outerShellPatch';

type OuterShellUniforms = {
  uStress: { value: number };
  uAccentStrength: { value: number };
  uEdgeStrength: { value: number };
  uInteractionPointLocal: { value: THREE.Vector3 };
  uInteractionRadius: { value: number };
};

export function createOuterShellMaterial() {
  const uniforms: OuterShellUniforms = {
    uStress: { value: 0 },
    uAccentStrength: { value: heroConfig.materials.shell.accentStrength },
    uEdgeStrength: { value: heroConfig.materials.shell.edgeStrength },
    uInteractionPointLocal: { value: new THREE.Vector3(999, 999, 999) },
    uInteractionRadius: { value: heroConfig.interaction.radius },
  };

  const material = new THREE.MeshPhysicalMaterial({
    color: '#dfe8f7',
    roughness: heroConfig.materials.shell.roughness,
    metalness: 0,
    transmission: heroConfig.materials.shell.transmission,
    thickness: heroConfig.materials.shell.thickness,
    ior: heroConfig.materials.shell.ior,
    clearcoat: heroConfig.materials.shell.clearcoat,
    clearcoatRoughness: heroConfig.materials.shell.clearcoatRoughness,
    transparent: true,
    opacity: heroConfig.materials.shell.opacity,
  });

  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = patchOuterShellVertexShader(shader.vertexShader);
    shader.fragmentShader = patchOuterShellFragmentShader(shader.fragmentShader);
    material.userData.shader = shader;
  };

  material.customProgramCacheKey = () => 'jsg-outer-shell-v1';
  material.userData.uniforms = uniforms;

  return material;
}
