type LandingHeroSvgProps = {
  className?: string;
};

const glyphFont = '"JetBrains Mono", "SFMono-Regular", Consolas, monospace';
const sideGlyphShift = 190;
const lockupShiftX = 42;

export function LandingHeroSvg({ className = '' }: LandingHeroSvgProps) {
  return (
    <div className={['landing-hero-svg', className].filter(Boolean).join(' ')} aria-hidden="true">
      <svg
        className="landing-hero-svg__scene"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid meet"
        focusable="false"
      >
        <defs>
          <radialGradient id="hero-bg-glow" cx="50%" cy="42%" r="56%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.12)" />
            <stop offset="38%" stopColor="rgba(255,255,255,0.05)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </radialGradient>

          <linearGradient id="shell-stroke" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.40)" />
            <stop offset="50%" stopColor="rgba(255,255,255,0.22)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0.12)" />
          </linearGradient>

          <linearGradient id="core-shimmer" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(184, 214, 255, 0.02)" />
            <stop offset="18%" stopColor="rgba(223, 233, 255, 0.20)" />
            <stop offset="52%" stopColor="rgba(255, 255, 255, 0.44)" />
            <stop offset="78%" stopColor="rgba(214, 232, 255, 0.18)" />
            <stop offset="100%" stopColor="rgba(184, 214, 255, 0.02)" />
          </linearGradient>

          <linearGradient id="core-band" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.02)" />
            <stop offset="50%" stopColor="rgba(255,255,255,0.32)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0.02)" />
          </linearGradient>

          <filter id="soft-blur" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="16" />
          </filter>

          <filter id="core-blur" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="9" />
          </filter>

          <filter id="grainy-soften" x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence type="fractalNoise" baseFrequency="0.55" numOctaves="2" seed="13" result="noise" />
            <feColorMatrix
              in="noise"
              type="matrix"
              values="1 0 0 0 0
                      0 1 0 0 0
                      0 0 1 0 0
                      0 0 0 0.12 0"
              result="fadedNoise"
            />
            <feBlend in="SourceGraphic" in2="fadedNoise" mode="screen" />
          </filter>

          <style>{`
            .landing-hero-svg__lockup {
              transform-origin: 720px 446px;
              animation: heroFloat 11s ease-in-out infinite;
            }

            .landing-hero-svg__glyph-shell {
              fill: rgba(255,255,255,0.04);
              stroke: url(#shell-stroke);
              stroke-width: 1.75px;
              vector-effect: non-scaling-stroke;
              paint-order: stroke fill;
            }

            .landing-hero-svg__glyph-inner-plate {
              fill: rgba(255,255,255,0.034);
            }

            .landing-hero-svg__core {
              opacity: 0.96;
            }

            .landing-hero-svg__core--j {
              transform-origin: 286px 446px;
              animation: coreDriftJ 13.5s ease-in-out infinite;
            }

            .landing-hero-svg__core--s {
              transform-origin: 720px 446px;
              animation: coreDriftS 15.5s ease-in-out infinite;
            }

            .landing-hero-svg__core--g {
              transform-origin: 1154px 446px;
              animation: coreDriftG 14.3s ease-in-out infinite;
            }

            .landing-hero-svg__shimmer-band {
              animation: bandSweep 9.5s linear infinite;
            }

            .landing-hero-svg__shimmer-band--slow {
              animation-duration: 13.5s;
              animation-delay: -4.2s;
            }

            .landing-hero-svg__pulse {
              animation: pulseGlow 4.6s ease-in-out infinite;
            }

            .landing-hero-svg__pulse--late {
              animation-delay: -1.7s;
            }

            .landing-hero-svg__pulse--later {
              animation-delay: -2.9s;
            }

            .landing-hero-svg__micro-shard {
              animation: microShardShift 8s ease-in-out infinite;
            }

            .landing-hero-svg__micro-shard--2 {
              animation-duration: 10.5s;
              animation-delay: -2.3s;
            }

            .landing-hero-svg__micro-shard--3 {
              animation-duration: 9.4s;
              animation-delay: -4.7s;
            }

            @keyframes heroFloat {
              0%, 100% { transform: translateY(0px) rotate(0deg); }
              35% { transform: translateY(-5px) rotate(-0.18deg); }
              68% { transform: translateY(4px) rotate(0.16deg); }
            }

            @keyframes coreDriftJ {
              0%, 100% { transform: translateY(0px) rotate(-0.2deg) scale(1); }
              50% { transform: translateY(-6px) rotate(0.45deg) scale(1.008); }
            }

            @keyframes coreDriftS {
              0%, 100% { transform: translateY(0px) rotate(0.12deg) scale(1); }
              50% { transform: translateY(5px) rotate(-0.5deg) scale(1.01); }
            }

            @keyframes coreDriftG {
              0%, 100% { transform: translateY(0px) rotate(0.18deg) scale(1); }
              50% { transform: translateY(-4px) rotate(0.42deg) scale(1.009); }
            }

            @keyframes bandSweep {
              0% { transform: translateX(-220px); opacity: 0; }
              12% { opacity: 0.44; }
              62% { opacity: 0.22; }
              100% { transform: translateX(220px); opacity: 0; }
            }

            @keyframes pulseGlow {
              0%, 100% { opacity: 0.24; transform: scale(0.96); }
              50% { opacity: 0.62; transform: scale(1.06); }
            }

            @keyframes microShardShift {
              0%, 100% { transform: translate(0px, 0px) rotate(0deg); opacity: 0.18; }
              50% { transform: translate(6px, -7px) rotate(4deg); opacity: 0.48; }
            }
          `}</style>

          <clipPath id="clip-j">
            <text x="290" y="540" textAnchor="middle" fontFamily={glyphFont} fontSize="380" fontWeight="800" letterSpacing="-24">
              J
            </text>
          </clipPath>
          <clipPath id="clip-s">
            <text x="720" y="540" textAnchor="middle" fontFamily={glyphFont} fontSize="380" fontWeight="800" letterSpacing="-18">
              S
            </text>
          </clipPath>
          <clipPath id="clip-g">
            <text x="1150" y="540" textAnchor="middle" fontFamily={glyphFont} fontSize="380" fontWeight="800" letterSpacing="-18">
              G
            </text>
          </clipPath>
        </defs>

        <rect width="1440" height="900" fill="transparent" />
        <ellipse cx={720 + lockupShiftX} cy="412" rx="520" ry="240" fill="url(#hero-bg-glow)" filter="url(#soft-blur)" />

        <g transform={`translate(${lockupShiftX} 0)`}>
          <g className="landing-hero-svg__lockup">
            <g className="landing-hero-svg__glyph landing-hero-svg__glyph--j" transform={`translate(${sideGlyphShift} 0)`}>
            <text x="290" y="540" textAnchor="middle" className="landing-hero-svg__glyph-shell" fontFamily={glyphFont} fontSize="380" fontWeight="800" letterSpacing="-24">
              J
            </text>
            <text x="290" y="540" textAnchor="middle" className="landing-hero-svg__glyph-inner-plate" fontFamily={glyphFont} fontSize="380" fontWeight="800" letterSpacing="-24">
              J
            </text>

            <g className="landing-hero-svg__core landing-hero-svg__core--j" clipPath="url(#clip-j)">
              <rect x="120" y="140" width="360" height="520" fill="rgba(255,255,255,0.015)" />
              <ellipse className="landing-hero-svg__pulse" cx="250" cy="350" rx="90" ry="110" fill="rgba(224, 235, 255, 0.40)" filter="url(#core-blur)" />
              <ellipse className="landing-hero-svg__pulse landing-hero-svg__pulse--late" cx="322" cy="470" rx="72" ry="96" fill="rgba(255,255,255,0.28)" filter="url(#core-blur)" />
              <polygon className="landing-hero-svg__micro-shard" points="180,258 244,206 282,318 214,336" fill="rgba(255,255,255,0.24)" filter="url(#grainy-soften)" />
              <polygon className="landing-hero-svg__micro-shard landing-hero-svg__micro-shard--2" points="246,334 312,274 350,394 278,416" fill="rgba(215,231,255,0.28)" filter="url(#grainy-soften)" />
              <polygon className="landing-hero-svg__micro-shard landing-hero-svg__micro-shard--3" points="218,430 294,388 320,500 236,520" fill="rgba(255,255,255,0.22)" filter="url(#grainy-soften)" />
              <g className="landing-hero-svg__shimmer-band">
                <rect x="92" y="160" width="96" height="560" fill="url(#core-band)" opacity="0.9" transform="rotate(10 140 320)" />
              </g>
              <g className="landing-hero-svg__shimmer-band landing-hero-svg__shimmer-band--slow">
                <rect x="202" y="160" width="76" height="560" fill="url(#core-band)" opacity="0.7" transform="rotate(-9 240 320)" />
              </g>
              <rect x="110" y="220" width="340" height="70" fill="url(#core-shimmer)" opacity="0.32" transform="rotate(-17 280 255)" />
              <rect x="126" y="382" width="300" height="58" fill="url(#core-shimmer)" opacity="0.26" transform="rotate(8 280 410)" />
            </g>
            </g>

            <g className="landing-hero-svg__glyph landing-hero-svg__glyph--s">
            <text x="720" y="540" textAnchor="middle" className="landing-hero-svg__glyph-shell" fontFamily={glyphFont} fontSize="380" fontWeight="800" letterSpacing="-18">
              S
            </text>
            <text x="720" y="540" textAnchor="middle" className="landing-hero-svg__glyph-inner-plate" fontFamily={glyphFont} fontSize="380" fontWeight="800" letterSpacing="-18">
              S
            </text>

            <g className="landing-hero-svg__core landing-hero-svg__core--s" clipPath="url(#clip-s)">
              <rect x="530" y="140" width="380" height="520" fill="rgba(255,255,255,0.015)" />
              <ellipse className="landing-hero-svg__pulse landing-hero-svg__pulse--later" cx="740" cy="288" rx="110" ry="88" fill="rgba(255,255,255,0.34)" filter="url(#core-blur)" />
              <ellipse className="landing-hero-svg__pulse landing-hero-svg__pulse--late" cx="698" cy="492" rx="104" ry="76" fill="rgba(223,235,255,0.34)" filter="url(#core-blur)" />
              <polygon className="landing-hero-svg__micro-shard" points="618,236 742,202 714,306 598,296" fill="rgba(255,255,255,0.24)" filter="url(#grainy-soften)" />
              <polygon className="landing-hero-svg__micro-shard landing-hero-svg__micro-shard--2" points="706,314 826,274 792,386 680,374" fill="rgba(216,231,255,0.28)" filter="url(#grainy-soften)" />
              <polygon className="landing-hero-svg__micro-shard landing-hero-svg__micro-shard--3" points="622,454 744,420 720,542 602,530" fill="rgba(255,255,255,0.22)" filter="url(#grainy-soften)" />
              <g className="landing-hero-svg__shimmer-band">
                <rect x="536" y="120" width="110" height="620" fill="url(#core-band)" opacity="0.84" transform="rotate(14 592 420)" />
              </g>
              <g className="landing-hero-svg__shimmer-band landing-hero-svg__shimmer-band--slow">
                <rect x="724" y="110" width="88" height="640" fill="url(#core-band)" opacity="0.66" transform="rotate(-12 768 420)" />
              </g>
              <rect x="546" y="232" width="350" height="62" fill="url(#core-shimmer)" opacity="0.28" transform="rotate(-9 720 264)" />
              <rect x="544" y="430" width="362" height="66" fill="url(#core-shimmer)" opacity="0.22" transform="rotate(11 720 463)" />
            </g>
            </g>

            <g className="landing-hero-svg__glyph landing-hero-svg__glyph--g" transform={`translate(${-sideGlyphShift} 0)`}>
            <text x="1150" y="540" textAnchor="middle" className="landing-hero-svg__glyph-shell" fontFamily={glyphFont} fontSize="380" fontWeight="800" letterSpacing="-18">
              G
            </text>
            <text x="1150" y="540" textAnchor="middle" className="landing-hero-svg__glyph-inner-plate" fontFamily={glyphFont} fontSize="380" fontWeight="800" letterSpacing="-18">
              G
            </text>

            <g className="landing-hero-svg__core landing-hero-svg__core--g" clipPath="url(#clip-g)">
              <rect x="952" y="140" width="392" height="520" fill="rgba(255,255,255,0.015)" />
              <ellipse className="landing-hero-svg__pulse" cx="1114" cy="338" rx="90" ry="104" fill="rgba(255,255,255,0.30)" filter="url(#core-blur)" />
              <ellipse className="landing-hero-svg__pulse landing-hero-svg__pulse--late" cx="1190" cy="484" rx="96" ry="78" fill="rgba(224,235,255,0.36)" filter="url(#core-blur)" />
              <polygon className="landing-hero-svg__micro-shard" points="1004,248 1124,206 1092,322 986,314" fill="rgba(255,255,255,0.24)" filter="url(#grainy-soften)" />
              <polygon className="landing-hero-svg__micro-shard landing-hero-svg__micro-shard--2" points="1118,306 1246,278 1210,390 1098,382" fill="rgba(216,231,255,0.27)" filter="url(#grainy-soften)" />
              <polygon className="landing-hero-svg__micro-shard landing-hero-svg__micro-shard--3" points="1034,432 1162,408 1130,536 1016,518" fill="rgba(255,255,255,0.22)" filter="url(#grainy-soften)" />
              <g className="landing-hero-svg__shimmer-band">
                <rect x="968" y="120" width="102" height="620" fill="url(#core-band)" opacity="0.84" transform="rotate(12 1020 420)" />
              </g>
              <g className="landing-hero-svg__shimmer-band landing-hero-svg__shimmer-band--slow">
                <rect x="1148" y="116" width="88" height="620" fill="url(#core-band)" opacity="0.68" transform="rotate(-10 1192 420)" />
              </g>
              <rect x="988" y="228" width="332" height="60" fill="url(#core-shimmer)" opacity="0.30" transform="rotate(-11 1154 258)" />
              <rect x="976" y="420" width="344" height="64" fill="url(#core-shimmer)" opacity="0.24" transform="rotate(7 1154 452)" />
            </g>
            </g>
          </g>
        </g>
      </svg>
    </div>
  );
}

export default LandingHeroSvg;
