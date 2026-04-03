export function patchOuterShellVertexShader(source: string) {
  return source
    .replace(
      '#include <common>',
      '#include <common>\nvarying vec3 vLocalPosition;',
    )
    .replace(
      '#include <begin_vertex>',
      '#include <begin_vertex>\nvLocalPosition = position;',
    );
}

export function patchOuterShellFragmentShader(source: string) {
  return source
    .replace(
      '#include <common>',
      [
        '#include <common>',
        'uniform float uStress;',
        'uniform float uAccentStrength;',
        'uniform float uEdgeStrength;',
        'uniform vec3 uInteractionPointLocal;',
        'uniform float uInteractionRadius;',
        'varying vec3 vLocalPosition;',
      ].join('\n'),
    )
    .replace(
      '#include <dithering_fragment>',
      [
        'float edgeFresnel = pow(1.0 - abs(dot(normalize(normal), normalize(vViewPosition))), 2.0);',
        'float interactionGlow = 1.0 - smoothstep(uInteractionRadius * 0.25, uInteractionRadius, distance(vLocalPosition, uInteractionPointLocal));',
        'gl_FragColor.rgb += vec3(0.16, 0.19, 0.24) * edgeFresnel * uEdgeStrength;',
        'gl_FragColor.rgb += vec3(0.08, 0.15, 0.3) * interactionGlow * uStress * uAccentStrength;',
        '#include <dithering_fragment>',
      ].join('\n'),
    );
}
