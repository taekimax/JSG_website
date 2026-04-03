import { useEffect, useState } from 'react';

import { LandingHeroSvg } from '@/components/hero/LandingHeroSvg';
import { LANDING_HERO_BUILD_LABEL, isLocalPreviewHost } from '@/lib/heroBuild';
import type { LandingCopy } from '@/types/hero';

type LandingHeroSectionProps = {
  children?: React.ReactNode;
  className?: string;
};

const defaultCopy: LandingCopy = {
  kicker: 'JSG Investment',
  leadKo:
    'JSG는 이성적이고 투명한 판단으로, 건강하고 지속 가능한 성장을 이끄는 과감한 혁신가에게 투자합니다. JSG 인베스트먼트는 서울 소재 금융위원회 등록 신기술금융사입니다.',
  leadEn:
    "At JSG, we back bold innovators to foster healthy, sustainable growth with disciplined reasoning and radical transparency. We are a Seoul-based venture capital firm registered with Korea's Financial Services Commission as a New-Technology Finance Company.",
  ctaLabel: '들어가기',
  ctaSub: 'Enter',
};

async function fetchText(url: string, signal: AbortSignal) {
  const response = await fetch(url, { cache: 'no-cache', signal });
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`);
  }

  return response.text();
}

export function LandingHeroSection({ children, className }: LandingHeroSectionProps) {
  const [copy, setCopy] = useState<LandingCopy>(defaultCopy);
  const showBuildBadge =
    typeof window !== 'undefined' && isLocalPreviewHost(window.location.hostname);

  useEffect(() => {
    const abortController = new AbortController();

    async function loadCopy() {
      try {
        const manifestResponse = await fetch('assets/landing/landing-manifest.json', {
          cache: 'no-cache',
          signal: abortController.signal,
        });

        if (!manifestResponse.ok) {
          throw new Error(`Failed to fetch landing manifest: ${manifestResponse.status}`);
        }

        const manifest = await manifestResponse.json();
        const assetVersion = manifest.assetVersion;
        const texts = manifest.texts || {};
        const versioned = (value: string) =>
          assetVersion ? `${value}${value.includes('?') ? '&' : '?'}v=${encodeURIComponent(assetVersion)}` : value;

        const [kicker, leadKo, leadEn, ctaLabel, ctaSub] = await Promise.all([
          fetchText(versioned(texts.heroKicker), abortController.signal),
          fetchText(versioned(texts.heroLead), abortController.signal),
          fetchText(versioned(texts.heroSub), abortController.signal),
          fetchText(versioned(texts.ctaLabel), abortController.signal),
          fetchText(versioned(texts.ctaSub), abortController.signal),
        ]);

        setCopy({
          kicker: kicker.trim(),
          leadKo: leadKo.trim(),
          leadEn: leadEn.trim(),
          ctaLabel: ctaLabel.trim(),
          ctaSub: ctaSub.trim(),
        });
      } catch (error) {
        if (!abortController.signal.aborted) {
          console.error('Failed to hydrate landing copy:', error);
        }
      }
    }

    loadCopy();

    return () => abortController.abort();
  }, []);

  useEffect(() => {
    const navigate = (event: KeyboardEvent) => {
      if (event.key === 'Enter') {
        window.location.href = 'about.html';
      }
    };

    window.addEventListener('keydown', navigate);
    return () => window.removeEventListener('keydown', navigate);
  }, []);

  const sectionClassName = ['landingHero', className].filter(Boolean).join(' ');

  return (
    <section className={sectionClassName} aria-labelledby="landing-hero-title">
      <div className="landingHero__canvas" aria-hidden="true">
        <LandingHeroSvg />
      </div>

      <div className="landingHero__content">
        <div className="landingHero__contentInner">
          <div className="landingHero__copyColumn">
            <p className="hero-kicker">{copy.kicker}</p>

            <div className="hero-copy hero-copy--stack">
              <p className="hero-statement hero-statement--ko">{copy.leadKo}</p>
              <p className="hero-statement hero-statement--en">{copy.leadEn}</p>
            </div>

            <div className="landingHero__ctaWrap">
              <button
                id="enterBtn"
                type="button"
                aria-label="Enter JSG site"
                onClick={() => {
                  window.location.href = 'about.html';
                }}
              >
                <span className="enter-btn-label">{copy.ctaLabel}</span>
                <span className="enter-btn-label">{copy.ctaSub}</span>
              </button>
            </div>

            {children}
          </div>
        </div>
      </div>

      {showBuildBadge ? (
        <p className="landingHero__buildBadge" aria-hidden="true">
          {LANDING_HERO_BUILD_LABEL}
        </p>
      ) : null}

      <h1 id="landing-hero-title" className="sr-only">
        JSG
      </h1>
    </section>
  );
}
