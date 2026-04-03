import * as THREE from 'three';
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js';

import { heroConfig } from '@/config/heroConfig';
import { glyphData } from '@/lib/glyph/glyphData';
import { glyphMetrics } from '@/lib/glyph/glyphMetrics';
import { getPolygonBounds } from '@/lib/math/bounds';
import type { GlyphBuildResult, GlyphId, GlyphPolygon, QualityTier } from '@/types/hero';

const loader = new SVGLoader();
const glyphCache = new Map<string, GlyphBuildResult>();

function sanitizePoints(points: THREE.Vector2[]) {
  const cleaned = points.map((point) => point.clone());

  if (cleaned.length > 1 && cleaned[0].distanceToSquared(cleaned[cleaned.length - 1]) < 1e-10) {
    cleaned.pop();
  }

  return cleaned;
}

function parseRawPolygons(id: GlyphId) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg"><path d="${glyphData[id]}" /></svg>`;
  const parsed = loader.parse(svg);

  return parsed.paths.flatMap((path) => SVGLoader.createShapes(path)).map((shape) => {
    const extracted = shape.extractPoints(32);

    return {
      outline: sanitizePoints(extracted.shape),
      holes: extracted.holes.map(sanitizePoints),
    };
  });
}

function normalizePolygons(id: GlyphId, polygons: GlyphPolygon[]): GlyphPolygon[] {
  const allPoints = polygons.flatMap((polygon) => [polygon.outline, ...polygon.holes]).flat();
  const bounds = getPolygonBounds(allPoints);
  const rawHeight = Math.max(bounds.height, 1);
  const rawWidth = Math.max(bounds.width, 1);
  const normalizedWidth = rawWidth / rawHeight;
  const targetWidth = glyphMetrics[id].width;
  const widthScale = targetWidth / normalizedWidth;

  const normalizePoint = (point: THREE.Vector2) =>
    new THREE.Vector2(
      ((point.x - bounds.minX) / rawHeight) * widthScale - targetWidth * 0.5,
      (bounds.maxY - point.y) / rawHeight,
    );

  return polygons.map((polygon) => ({
    outline: polygon.outline.map(normalizePoint),
    holes: polygon.holes.map((hole) => hole.map(normalizePoint)),
  }));
}

function buildShapes(polygons: GlyphPolygon[]) {
  return polygons.map((polygon) => {
    const shape = new THREE.Shape(polygon.outline);
    shape.holes = polygon.holes.map((hole) => new THREE.Path(hole));
    return shape;
  });
}

function getBounds(polygons: GlyphPolygon[]) {
  const allPoints = polygons.flatMap((polygon) => [polygon.outline, ...polygon.holes]).flat();
  return getPolygonBounds(allPoints);
}

export function buildGlyphShapes(id: GlyphId, tier: QualityTier): GlyphBuildResult {
  const cacheKey = `${id}:${tier}`;
  const cached = glyphCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  const polygons = normalizePolygons(id, parseRawPolygons(id));
  const shapes = buildShapes(polygons);
  const geometry = new THREE.ExtrudeGeometry(shapes, {
    depth: heroConfig.geometry.depth,
    steps: heroConfig.geometry.steps,
    bevelEnabled: heroConfig.geometry.bevelEnabled,
    bevelSegments: heroConfig.geometry.bevelSegments,
    bevelSize: heroConfig.geometry.bevelSize,
    bevelThickness: heroConfig.geometry.bevelThickness,
    curveSegments: heroConfig.geometry.curveSegments[tier],
  });

  geometry.translate(0, 0, -heroConfig.geometry.depth * 0.5);
  geometry.computeVertexNormals();

  const bounds = getBounds(polygons);
  const result: GlyphBuildResult = {
    geometry,
    polygons,
    bounds,
    metrics: {
      width: bounds.width,
      height: bounds.height,
    },
  };

  glyphCache.set(cacheKey, result);
  return result;
}
