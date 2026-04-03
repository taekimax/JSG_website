import { clamp } from '@/lib/math/clamp';

export function computeMoveImpulse(velocity: number, multiplier: number, cap: number): number {
  return clamp(velocity * multiplier, 0, cap);
}
