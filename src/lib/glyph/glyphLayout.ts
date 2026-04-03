import { heroConfig } from '@/config/heroConfig';
import { glyphMetrics } from '@/lib/glyph/glyphMetrics';
import { getHeroBreakpoint } from '@/lib/math/viewport';
import type { GlyphSpec } from '@/types/hero';

function getGapRatio(width: number) {
  const breakpoint = getHeroBreakpoint(width);

  if (breakpoint === 'mobile') {
    return heroConfig.layout.gapRatioMobile;
  }

  if (breakpoint === 'tablet') {
    return heroConfig.layout.gapRatioTablet;
  }

  return heroConfig.layout.gapRatioDesktop;
}

function getViewportFrustum(viewportWidth: number, viewportHeight: number, cameraZ: number) {
  const safeViewportHeight = Math.max(viewportHeight, 1);
  const aspect = viewportWidth / safeViewportHeight;
  const viewHeight = 2 * Math.tan((heroConfig.camera.fov * Math.PI) / 360) * cameraZ;
  const viewWidth = viewHeight * aspect;

  return {
    viewHeight,
    viewWidth,
  };
}

export function computeGlyphLayout(viewportWidth: number, viewportHeight: number) {
  const breakpoint = getHeroBreakpoint(viewportWidth);
  const gap = heroConfig.layout.representativeGlyphWidth * getGapRatio(viewportWidth);
  const widthJ = glyphMetrics.J.width;
  const widthS = glyphMetrics.S.width;
  const widthG = glyphMetrics.G.width;
  const totalWidth = widthJ + widthS + widthG + gap * 2;
  const startX = -totalWidth * 0.5;
  const jX = startX + widthJ * 0.5;
  const sX = jX + widthJ * 0.5 + gap + widthS * 0.5;
  const gX = sX + widthS * 0.5 + gap + widthG * 0.5;

  const specs: GlyphSpec[] = [
    {
      id: 'J',
      width: widthJ,
      height: glyphMetrics.J.height,
      depth: heroConfig.geometry.depth,
      position: [jX, heroConfig.layout.baselineY, 0],
      bevelSize: heroConfig.geometry.bevelSize,
      bevelThickness: heroConfig.geometry.bevelThickness,
    },
    {
      id: 'S',
      width: widthS,
      height: glyphMetrics.S.height,
      depth: heroConfig.geometry.depth,
      position: [sX, heroConfig.layout.baselineY, 0],
      bevelSize: heroConfig.geometry.bevelSize,
      bevelThickness: heroConfig.geometry.bevelThickness,
    },
    {
      id: 'G',
      width: widthG,
      height: glyphMetrics.G.height,
      depth: heroConfig.geometry.depth,
      position: [gX, heroConfig.layout.baselineY, 0],
      bevelSize: heroConfig.geometry.bevelSize,
      bevelThickness: heroConfig.geometry.bevelThickness,
    },
  ];

  const cameraPosition = heroConfig.camera.responsivePosition[breakpoint];
  const { viewHeight, viewWidth } = getViewportFrustum(
    viewportWidth,
    viewportHeight,
    Math.abs(cameraPosition[2] - heroConfig.camera.target[2]),
  );
  const maxGlyphHeight = Math.max(...specs.map((spec) => spec.position[1] + spec.height));
  const minGlyphHeight = Math.min(...specs.map((spec) => spec.position[1]));
  const totalHeight = maxGlyphHeight - minGlyphHeight;
  const widthFitScale = (viewWidth * heroConfig.layout.targetWidthRatio[breakpoint]) / totalWidth;
  const heightFitScale = (viewHeight * heroConfig.layout.maxHeightRatio[breakpoint]) / totalHeight;
  const groupScale = Math.min(heroConfig.layout.groupScale[breakpoint], widthFitScale, heightFitScale);
  const groupOffsetY =
    heroConfig.layout.groupCenterY - (minGlyphHeight + totalHeight * 0.5) * groupScale;

  return {
    breakpoint,
    groupOffsetY,
    groupScale,
    cameraPosition,
    specs,
  };
}
