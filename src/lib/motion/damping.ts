export function damp(current: number, target: number, lambda: number, deltaTime: number): number {
  return current + (target - current) * (1 - Math.exp(-lambda * deltaTime));
}
