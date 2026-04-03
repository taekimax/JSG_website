import { useEffect, useState } from 'react';

import type { QualityTier } from '@/types/hero';

function resolveQualityTier(reducedMotion: boolean): QualityTier {
  if (reducedMotion) {
    return 'reduced';
  }

  const width = window.innerWidth;
  const dpr = window.devicePixelRatio || 1;
  const concurrency = navigator.hardwareConcurrency || 8;

  if (width < 768 || dpr > 2 || concurrency <= 4) {
    return 'medium';
  }

  return 'high';
}

export function useQualityTier(reducedMotion: boolean) {
  const [tier, setTier] = useState<QualityTier>(() =>
    typeof window === 'undefined' ? 'high' : resolveQualityTier(reducedMotion),
  );

  useEffect(() => {
    const update = () => setTier(resolveQualityTier(reducedMotion));

    update();
    window.addEventListener('resize', update, { passive: true });

    return () => window.removeEventListener('resize', update);
  }, [reducedMotion]);

  return tier;
}
