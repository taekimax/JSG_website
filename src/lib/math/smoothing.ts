import { clamp } from '@/lib/math/clamp';

export function smoothstep(min: number, max: number, value: number): number {
  const t = clamp((value - min) / (max - min), 0, 1);
  return t * t * (3 - 2 * t);
}
