# Bundled web fonts

Served from this site through `styles/tokens.css`, with no CDN or system-installed font dependency. The font files are unmodified upstream assets. The main HTML pages preload them; `font-display: swap` shows fallback text during first download.

- `PretendardVariable.woff2` — Pretendard 1.3.9; 2,057,688 bytes. [Pinned source](https://raw.githubusercontent.com/orioncactus/pretendard/v1.3.9/packages/pretendard/dist/web/variable/woff2/PretendardVariable.woff2). SHA-256: `9599f12fd42fc0bce1cd50b47a0c022e108d7aa64dd0d1bb0ed44f3282d900b4`.
- `JetBrainsMonoNerdFont-Regular.ttf` — Nerd Fonts 3.5.1 / JetBrains Mono 2.304; 2,571,596 bytes. [Pinned source](https://raw.githubusercontent.com/ryanoasis/nerd-fonts/v3.5.1/patched-fonts/JetBrainsMono/Ligatures/JetBrainsMonoNerdFont-Regular.ttf). SHA-256: `1c680e8cde9fcf8b88a5605ce8d1fb94dd3fb15841f7ca7bf4c55664855e5611`.

All live website text uses JetBrainsMono NF Regular for Latin characters, with D2Coding for Korean glyphs. Both body and title tokens share this stack. D2Coding Regular 400 and Bold 700 are bundled; existing sizes, weights and line spacing remain in place. JetBrains Mono is the fixed-width family, not Propo, and retains the navigation icon glyphs. The header wordmark is 18px and the footer wordmark is 20px.

- `D2Coding-Regular.ttf` — D2Coding 1.3.3; 4,185,500 bytes. SHA-256: `c064f343b5cfc131f083377ba606b748f9b61a5bbd89708e4010b9066dff5a24`.
- `D2Coding-Bold.ttf` — D2Coding 1.3.3; 4,359,628 bytes. SHA-256: `770afd3304d03924a05744335315f9dbb51f30870a3e24b05ffba9abd2f9400f`.
- [Pinned D2Coding source and license](https://github.com/naver/d2-coding-font/tree/d95bc36438113099566bb39064334608955c2612). License bundled as `D2Coding-OFL.txt`.

Other licenses and attribution: `Pretendard-OFL.txt`, `JetBrainsMono-OFL.txt`, `NerdFonts-LICENSE.txt`, `NerdFonts-JetBrainsMono-README.md`. Pretendard is retained for existing image assets; it is no longer the live text font or preloaded by the pages. Text baked into logos or map images is unchanged.
