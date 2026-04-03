import { useMemo, useRef } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';

import { clamp } from '@/lib/math/clamp';
import type { HeroPointerState } from '@/types/hero';

export function useHeroPointer() {
  const surfaceRef = useRef<HTMLDivElement | null>(null);
  const lastSampleRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const pointerRef = useRef<HeroPointerState>({
    ndc: { x: 99, y: 99 },
    viewport: { x: -1, y: -1 },
    velocity: 0,
    isDown: false,
    lastTapAt: 0,
  });

  const updatePointer = (event: ReactPointerEvent<HTMLDivElement>) => {
    const rect = surfaceRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0 || rect.height === 0) {
      return;
    }

    const viewportX = clamp((event.clientX - rect.left) / rect.width, 0, 1);
    const viewportY = clamp((event.clientY - rect.top) / rect.height, 0, 1);
    const now = performance.now();
    const lastSample = lastSampleRef.current;
    let velocity = 0;

    if (lastSample) {
      const dx = viewportX - lastSample.x;
      const dy = viewportY - lastSample.y;
      const dt = Math.max(now - lastSample.time, 1);
      velocity = Math.hypot(dx, dy) / dt;
    }

    pointerRef.current.ndc = {
      x: viewportX * 2 - 1,
      y: -(viewportY * 2 - 1),
    };
    pointerRef.current.viewport = {
      x: viewportX,
      y: viewportY,
    };
    pointerRef.current.velocity = velocity;

    lastSampleRef.current = {
      x: viewportX,
      y: viewportY,
      time: now,
    };
  };

  const handlers = useMemo(
    () => ({
      onPointerMove(event: ReactPointerEvent<HTMLDivElement>) {
        updatePointer(event);
      },
      onPointerDown(event: ReactPointerEvent<HTMLDivElement>) {
        updatePointer(event);
        pointerRef.current.isDown = true;
        pointerRef.current.lastTapAt = performance.now();
      },
      onPointerUp(event: ReactPointerEvent<HTMLDivElement>) {
        updatePointer(event);
        pointerRef.current.isDown = false;
      },
      onPointerLeave() {
        pointerRef.current.isDown = false;
        pointerRef.current.velocity = 0;
        pointerRef.current.ndc = { x: 99, y: 99 };
        pointerRef.current.viewport = { x: -1, y: -1 };
      },
      onPointerCancel() {
        pointerRef.current.isDown = false;
        pointerRef.current.velocity = 0;
        pointerRef.current.ndc = { x: 99, y: 99 };
        pointerRef.current.viewport = { x: -1, y: -1 };
      },
    }),
    [],
  );

  return {
    surfaceRef,
    pointerRef,
    handlers,
  };
}
