import * as THREE from 'three';

import { heroConfig } from '@/config/heroConfig';
import { clamp } from '@/lib/math/clamp';
import { mulberry32 } from '@/lib/motion/seededRandom';
import type { GlyphId, GlyphPolygon, ShardInstanceData } from '@/types/hero';

const TAU = Math.PI * 2;

function pointInPolygon(point: THREE.Vector2, polygon: THREE.Vector2[]) {
  let inside = false;

  for (let current = 0, previous = polygon.length - 1; current < polygon.length; previous = current, current += 1) {
    const currentPoint = polygon[current];
    const previousPoint = polygon[previous];
    const intersects =
      currentPoint.y > point.y !== previousPoint.y > point.y &&
      point.x <
        ((previousPoint.x - currentPoint.x) * (point.y - currentPoint.y)) /
          (previousPoint.y - currentPoint.y + Number.EPSILON) +
          currentPoint.x;

    if (intersects) {
      inside = !inside;
    }
  }

  return inside;
}

function pointInGlyph(point: THREE.Vector2, polygons: GlyphPolygon[]) {
  return polygons.some((polygon) => {
    if (!pointInPolygon(point, polygon.outline)) {
      return false;
    }

    return !polygon.holes.some((hole) => pointInPolygon(point, hole));
  });
}

function distanceToSegment(point: THREE.Vector2, start: THREE.Vector2, end: THREE.Vector2) {
  const segment = new THREE.Vector2().subVectors(end, start);
  const offset = new THREE.Vector2().subVectors(point, start);
  const lengthSquared = Math.max(segment.lengthSq(), 1e-8);
  const projection = clamp(offset.dot(segment) / lengthSquared, 0, 1);
  const closest = start.clone().add(segment.multiplyScalar(projection));
  return closest.distanceTo(point);
}

function minDistanceToContours(point: THREE.Vector2, polygons: GlyphPolygon[]) {
  let minDistance = Number.POSITIVE_INFINITY;

  for (const polygon of polygons) {
    const contours = [polygon.outline, ...polygon.holes];

    for (const contour of contours) {
      for (let index = 0; index < contour.length; index += 1) {
        const start = contour[index];
        const end = contour[(index + 1) % contour.length];
        minDistance = Math.min(minDistance, distanceToSegment(point, start, end));
      }
    }
  }

  return minDistance;
}

export function sampleInteriorAnchors(
  id: GlyphId,
  polygons: GlyphPolygon[],
  bounds: { minX: number; maxX: number; minY: number; maxY: number },
  count: number,
) {
  const random = mulberry32(id === 'J' ? 101 : id === 'S' ? 202 : 303);
  const anchors: ShardInstanceData[] = [];
  const attempts = count * heroConfig.anchors.maxAttemptsMultiplier;
  let margin = heroConfig.anchors.edgeMargin;

  for (let attempt = 0; attempt < attempts && anchors.length < count; attempt += 1) {
    if (attempt > attempts * 0.55) {
      margin = heroConfig.anchors.edgeMargin * 0.72;
    }

    if (attempt > attempts * 0.8) {
      margin = heroConfig.anchors.edgeMargin * 0.5;
    }

    const point = new THREE.Vector2(
      THREE.MathUtils.lerp(bounds.minX, bounds.maxX, random()),
      THREE.MathUtils.lerp(bounds.minY, bounds.maxY, random()),
    );

    if (!pointInGlyph(point, polygons)) {
      continue;
    }

    if (minDistanceToContours(point, polygons) < margin) {
      continue;
    }

    const orbitAxis = new THREE.Vector3(random() - 0.5, random() - 0.5, random() - 0.5).normalize();
    anchors.push({
      basePosition: new THREE.Vector3(
        point.x,
        point.y,
        THREE.MathUtils.lerp(heroConfig.anchors.zMin, heroConfig.anchors.zMax, random()),
      ),
      baseScale: THREE.MathUtils.lerp(heroConfig.shards.size.min, heroConfig.shards.size.max, random()),
      seed: random(),
      orbitAxis,
      phase: random() * TAU,
      speed: 0.65 + random() * 0.95,
      colorBias: random(),
    });
  }

  return anchors;
}
