import type { HeroBreakpoint } from '@/types/hero';

export function getHeroBreakpoint(width: number): HeroBreakpoint {
  if (width < 768) {
    return 'mobile';
  }

  if (width < 1200) {
    return 'tablet';
  }

  return 'desktop';
}
