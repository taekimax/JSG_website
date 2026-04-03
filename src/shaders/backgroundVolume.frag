uniform float uTime;
uniform float uNoiseAmplitude;
uniform float uNoiseSpeed;
uniform vec3 uBaseColor;
uniform vec3 uCenterColor;
uniform vec3 uAccentColor;

varying vec2 vUv;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);

  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));

  vec2 u = f * f * (3.0 - 2.0 * f);

  return mix(a, b, u.x) +
    (c - a) * u.y * (1.0 - u.x) +
    (d - b) * u.x * u.y;
}

void main() {
  vec2 centered = vUv - 0.5;
  float radial = 1.0 - smoothstep(0.08, 0.88, length(centered * vec2(1.0, 1.25)));
  float accent = 1.0 - smoothstep(0.05, 0.55, length((vUv - vec2(0.54, 0.62)) * vec2(1.15, 1.7)));
  float grain = (noise(vUv * 4.0 + vec2(uTime * uNoiseSpeed, 0.0)) - 0.5) * (uNoiseAmplitude * 2.0);

  vec3 color = mix(uBaseColor, uCenterColor, radial);
  color += uAccentColor * accent * 0.08;
  color += vec3(grain);

  gl_FragColor = vec4(color, 1.0);
}
